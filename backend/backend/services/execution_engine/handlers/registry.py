"""Registry mapping handler types to concrete implementations."""

from typing import Dict, Type

from backend.exceptions import InvalidStateException
from backend.workflow.spec import HandlerType

from .base import NodeHandler

_HANDLER_REGISTRY: Dict[HandlerType, Type[NodeHandler]] = {}


def register_handler(handler_type: HandlerType, handler_cls: Type[NodeHandler]):
    _HANDLER_REGISTRY[handler_type] = handler_cls


def get_handler_class(handler_type: HandlerType) -> Type[NodeHandler]:
    handler_cls = _HANDLER_REGISTRY.get(handler_type)
    if not handler_cls:
        raise InvalidStateException(f"No handler registered for handler_type={handler_type}")
    return handler_cls


# Import handler modules to trigger registration side effects.
from . import code_execution, final_paper, generic_avl, generic_sca, generic_varl, narrative_synthesis, taskbook_generator  # noqa: E402,F401

