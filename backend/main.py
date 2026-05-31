from fastapi import FastAPI

from app.auth.router import router as auth_router
from app.routers.protected import router as protected_router

app = FastAPI(title="Bishkek Hackathon API")

app.include_router(auth_router)
app.include_router(protected_router)


@app.get("/")
def read_root():
    return {"message": "Hello, World!"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
