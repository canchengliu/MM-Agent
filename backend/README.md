# O-Award Workflow Engine Backend

This project is a FastAPI-based backend that implements the workflow engine defined in `docs/mm_agent.md`. It satisfies all requirements around HITL modes, dynamic workflow generation, dependency tracking, and version management.

## Running the service

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn backend.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

> **Environment:** copy `.env` and update `DATABASE_URL` to point to your database (SQLite, Postgres, etc.) before starting the service so the ORM and migrations share the same connection string.

## Key Features
- Workflow initialization using predefined Taskbook specifications.
- Node execution simulator with SCA, VARL, and AVL HITL modes.
- External data resolution (R3.5) and dependency enforcement (R7.1).
- HITL submission handling for continue/reject/discard flows.
- Dynamic phase-2 node insertion driven by HITL selections.

Refer to `docs/mm_agent.md` for the authoritative specification.
