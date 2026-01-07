Celery runbook

Overview
--------
This project uses Celery for background processing (image thumbnail generation, VIN lookups, etc.). The app is configured to read Celery settings from Django settings (see `backend/config/settings.py`).

Quick start (development)
-------------------------
1. Start Redis locally (using Docker):

   docker run -p 6379:6379 --name seek_redis -d redis:7-alpine

2. Activate your virtualenv and install requirements (should already include `celery` and `redis`):

   pip install -r requirements.txt

3. Start a Celery worker (from project root):

   # set DJANGO_SETTINGS_MODULE if not already set
   export DJANGO_SETTINGS_MODULE=config.settings
   celery -A config.celery worker --loglevel=info

4. For scheduled tasks (periodic), run the beat service:

   celery -A config.celery beat --loglevel=info

Running with Docker Compose
---------------------------
A sample `docker-compose.celery.yml` is provided for local testing. Start services with:

   docker compose -f docker-compose.celery.yml up --build

This will start Redis, the web service, and a Celery worker. The compose file relies on a `backend/Dockerfile` to build the `web` and `worker` images; a minimal `backend/Dockerfile` is included in the repo.

Production notes
----------------
- Use a managed Redis instance for production with TLS when appropriate.
- Run multiple worker replicas for throughput and set appropriate `concurrency`.
- Configure monitoring (Flower, Prometheus exporter) and logs/alerts for failed tasks.
- Ensure tasks are idempotent and add retries with backoff for transient errors.

Common troubleshooting
----------------------
- "Task not found" on worker: make sure `autodiscover_tasks()` finds your tasks; each app should expose `tasks.py`.
- "ConnectionRefusedError": check `CELERY_BROKER_URL` and that Redis is reachable.
- To force synchronous fallback for local dev, tasks defined with a synchronous helper are available (see `apps/vehicles/tasks.py`).
