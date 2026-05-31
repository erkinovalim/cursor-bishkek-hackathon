# Backend

FastAPI app with JWT authentication and role-based authorization.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # optional: set SECRET_KEY for JWT
```

## Run the app

```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload
```

The server starts at http://127.0.0.1:8000.

## Useful URLs

| URL | Purpose |
|-----|---------|
| http://127.0.0.1:8000 | Root endpoint |
| http://127.0.0.1:8000/health | Health check |
| http://127.0.0.1:8000/docs | Swagger UI |
| http://127.0.0.1:8000/redoc | API docs |

## Quick auth test

1. `POST /auth/register` with `{"email": "user@example.com", "password": "password123"}`
2. `POST /auth/login` with the same credentials and copy the `access_token`
3. In Swagger, click **Authorize** and enter `Bearer <your-token>`
4. Call `GET /auth/me` or `GET /protected/profile`

Use `--reload` during development so the server restarts when you edit code.
