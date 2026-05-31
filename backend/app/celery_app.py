from celery import Celery
from celery.schedules import crontab

from app.config import settings

celery_app = Celery(
    "bishkek_hackathon",
    broker=settings.celery_broker_url,
    include=["app.tasks.quests"],
)
celery_app.conf.timezone = settings.celery_timezone
celery_app.conf.beat_schedule = {
    "generate-daily-quest": {
        "task": "app.tasks.quests.generate_daily_quest",
        "schedule": crontab(
            hour=settings.daily_quest_hour,
            minute=settings.daily_quest_minute,
        ),
    },
}
