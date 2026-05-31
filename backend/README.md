# Backend

FastAPI app with JWT authentication, quests, and Celery Beat daily quest generation.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Start Redis (required for Celery):

```bash
docker run -d -p 6379:6379 redis:7
```

## Run the app

```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload
```

The server starts at http://127.0.0.1:8000.

## Run Celery worker and beat

In separate terminals:

```bash
cd backend
source .venv/bin/activate
celery -A app.celery_app.celery_app worker --loglevel=info
```

```bash
cd backend
source .venv/bin/activate
celery -A app.celery_app.celery_app beat --loglevel=info
```

Celery Beat runs `generate_daily_quest` every day at midnight UTC (configurable via `DAILY_QUEST_HOUR` / `DAILY_QUEST_MINUTE`).

To trigger daily quest generation manually:

```bash
celery -A app.celery_app.celery_app call app.tasks.quests.generate_daily_quest
```

## Quest API

All quest routes require authentication. Create/update/delete require the `admin` role.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/quests` | List quests (optional `?date=YYYY-MM-DD`) |
| GET | `/quests/{id}` | Get quest with tasks |
| POST | `/quests` | Create quest |
| PUT | `/quests/{id}` | Update quest |
| DELETE | `/quests/{id}` | Delete quest |

## Useful URLs

| URL | Purpose |
|-----|---------|
| http://127.0.0.1:8000 | Root endpoint |
| http://127.0.0.1:8000/health | Health check |
| http://127.0.0.1:8000/docs | Swagger UI |
| http://127.0.0.1:8000/redoc | API docs |

## Quick auth test

1. `POST /auth/register` with `{"email": "admin@example.com", "password": "password123", "role": "admin"}`
2. `POST /auth/login` with the same credentials and copy the `access_token`
3. In Swagger, click **Authorize** and enter `Bearer <your-token>`
4. Call `GET /quests` or create a quest via `POST /quests`

Use `--reload` during development so the server restarts when you edit code.
