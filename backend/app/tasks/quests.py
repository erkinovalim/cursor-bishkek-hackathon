from app.celery_app import celery_app
from app.database import SessionLocal
from app.services.quests import generate_daily_quest


@celery_app.task(name="app.tasks.quests.generate_daily_quest")
def generate_daily_quest_task() -> dict:
    db = SessionLocal()
    try:
        quest = generate_daily_quest(db)
        return {"quest_id": quest.id, "date": quest.date.isoformat()}
    finally:
        db.close()
