"""Alembic environment configuration with SQLite batch-mode support."""

import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# --- START: Application Integration ---
# Allow Alembic to import from the project package.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.config import settings
from backend.database import Base
from backend.models import *  # noqa: F401,F403 - needed for metadata population

# --- END: Application Integration ---

# Alembic Config object, provides access to the values within the .ini file.
config = context.config

# --- START: Configuration Update ---
# Ensure Alembic uses the same database URL as the application settings.
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
# --- END: Configuration Update ---

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --- START: Model Metadata ---
target_metadata = Base.metadata
# --- END: Model Metadata ---


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    render_as_batch = url.startswith("sqlite")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=render_as_batch,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        render_as_batch = connection.dialect.name == "sqlite"

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=render_as_batch,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
