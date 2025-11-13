#!/usr/bin/env python3
"""
脚本用于重新创建所有数据表并创建管理员账号。

使用方法:
    python reset_database.py

注意: 此脚本会删除所有现有数据，请谨慎使用！
"""

import sys
from pathlib import Path

# 添加backend目录到Python路径
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from loguru import logger

from backend.config import settings
from backend.database import Base, SessionLocal, engine
from backend.auth.security import get_password_hash

# 导入所有模型以确保它们被注册到Base.metadata
# 这样Base.metadata.create_all()才能创建所有表
from backend.models import (
    User,
    UserSettings,
    Project,
    ProjectFile,
    HistoricalProblem,
    WorkflowInstance,
    NodeInstance,
    NodeVersion,
    TemporaryExecutionResult,
)


def drop_all_tables():
    """删除所有数据表"""
    logger.info("正在删除所有数据表...")
    Base.metadata.drop_all(bind=engine)
    logger.info("所有数据表已删除")


def create_all_tables():
    """创建所有数据表"""
    logger.info("正在创建所有数据表...")
    Base.metadata.create_all(bind=engine)
    logger.info("所有数据表已创建")


def create_admin_user():
    """创建管理员账号"""
    db = SessionLocal()
    try:
        # 检查用户是否已存在
        existing_user = db.query(User).filter(User.email == "admin@agent.com").first()
        if existing_user:
            logger.warning("用户 admin@agent.com 已存在，跳过创建")
            return

        # 创建用户
        hashed_password = get_password_hash("mmAgent@123")
        admin_user = User(
            email="admin@agent.com",
            hashed_password=hashed_password,
            display_name="Admin",
            is_active=True,
            is_verified=True,  # 设置为已验证，以便可以直接登录
        )

        # 创建用户设置
        admin_user.settings = UserSettings()

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        logger.info(f"管理员账号创建成功: {admin_user.email} (ID: {admin_user.id})")
    except Exception as e:
        db.rollback()
        logger.error(f"创建管理员账号失败: {e}")
        raise
    finally:
        db.close()


def main():
    """主函数"""
    logger.info("开始重置数据库...")
    logger.info(f"数据库URL: {settings.DATABASE_URL}")

    try:
        # 删除所有表
        drop_all_tables()

        # 创建所有表
        create_all_tables()

        # 创建管理员账号
        create_admin_user()

        logger.info("数据库重置完成！")
        logger.info("管理员账号信息:")
        logger.info("  邮箱: admin@agent.com")
        logger.info("  密码: mmAgent@123")
    except Exception as e:
        logger.error(f"数据库重置失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

