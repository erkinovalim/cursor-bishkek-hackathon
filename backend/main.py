from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.auth.router import router as auth_router
from app.database import Base, engine
from app.routers.protected import router as protected_router
from app.routers.quests import router as quests_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Bishkek Hackathon API", lifespan=lifespan)

app.include_router(auth_router)
app.include_router(protected_router)
app.include_router(quests_router)


@app.get("/")
def read_root():
    return {"message": "Hello, World!"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
