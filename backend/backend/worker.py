"""arq worker definition for executing node simulations."""

from __future__ import annotations

import traceback
from typing import Any, Dict

from arq.connections import RedisSettings
from loguru import logger
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, joinedload

from backend.config import settings
from backend.logging_config import setup_logging
from backend.models.workflow import ExecutionStage, NodeInstance, NodeStatus, WorkflowInstance
from backend.schemas.events import EventType
from backend.schemas.node import NodeInstanceRead
from backend.services.node_service import NodeService
from backend.task_names import TASK_EXECUTE_NODE
from backend.utils.event_utils import broadcast_event

setup_logging()

connect_args: Dict[str, Any] = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


async def execute_node_task(ctx: Dict[str, Any], node_id: int, **kwargs: Any) -> None:
    """arq background task that executes a node with resilient error handling."""

    with logger.contextualize(node_id=node_id, job_args=kwargs):
        logger.info("Worker received task to execute node")
        db = SessionLocal()
        try:
            node = (
                db.query(NodeInstance)
                .options(
                    joinedload(NodeInstance.workflow).joinedload(WorkflowInstance.project),
                    joinedload(NodeInstance.temporary_result),
                )
                .get(node_id)
            )
            if not node:
                logger.error("Node not found in database. Discarding job.")
                return

            if node.status != NodeStatus.EXECUTING:
                logger.warning(
                    "Worker picked up stale job for node. Discarding.",
                    node_status=node.status.value,
                )
                return

            node_service = NodeService(db)
            await node_service.execute_in_worker(node, **kwargs)

        except Exception as exc:
            logger.exception("Worker task for node failed permanently.")
            fail_db = None
            try:
                fail_db = SessionLocal()
                node_to_fail = fail_db.query(NodeInstance).get(node_id)
                if node_to_fail and node_to_fail.status == NodeStatus.EXECUTING:
                    node_to_fail.status = NodeStatus.FAILED
                    node_to_fail.current_stage = ExecutionStage.FAILED
                    if node_to_fail.temporary_result:
                        node_to_fail.temporary_result.error_log = f"Worker Error: {exc}\n{traceback.format_exc()}"

                    fail_db.commit()
                    node_data = NodeInstanceRead.model_validate(node_to_fail).model_dump(mode="json")
                    await broadcast_event(
                        node_to_fail.workflow_instance_id,
                        EventType.NODE_STATUS_UPDATED,
                        node_data,
                        node_id=node_to_fail.id,
                    )
            except Exception:
                logger.exception(
                    "CRITICAL: Failed to update node status to FAILED after task error.",
                    failed_node_id=node_id,
                )
            finally:
                if fail_db:
                    fail_db.close()
        finally:
            db.close()
        logger.info("Worker finished task for node")


async def on_job_failure(ctx: Dict[str, Any], job: Any, exc: BaseException) -> None:
    """Log jobs that exhausted retries for easier inspection."""

    logger.error(
        "Job failed permanently after all retries.",
        job_function=job.function,
        job_args=job.args,
        exception=str(exc),
    )


class WorkerSettings:
    """arq worker configuration."""

    functions = [execute_node_task]
    redis_settings = RedisSettings.from_dsn(str(settings.REDIS_URL))
    job_timeout = 300  # 5 minutes
    on_job_failure = on_job_failure


__all__ = ["WorkerSettings", "execute_node_task", "TASK_EXECUTE_NODE"]
