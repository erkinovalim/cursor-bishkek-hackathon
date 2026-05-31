from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models import Quest, QuestTask
from app.quest_schemas import QuestCreate, QuestUpdate

DEFAULT_DAILY_TASKS = [
    {"description": "Complete your morning routine", "points": 10},
    {"description": "Learn something new for 30 minutes", "points": 20},
    {"description": "Help someone today", "points": 15},
]


def get_quest(db: Session, quest_id: int) -> Quest | None:
    return (
        db.query(Quest)
        .options(joinedload(Quest.tasks))
        .filter(Quest.id == quest_id)
        .first()
    )


def get_quest_by_date(db: Session, quest_date: date) -> Quest | None:
    return (
        db.query(Quest)
        .options(joinedload(Quest.tasks))
        .filter(Quest.date == quest_date)
        .first()
    )


def list_quests(db: Session, quest_date: date | None = None) -> list[Quest]:
    query = db.query(Quest).options(joinedload(Quest.tasks)).order_by(Quest.date.desc())
    if quest_date is not None:
        query = query.filter(Quest.date == quest_date)
    return query.all()


def create_quest(db: Session, payload: QuestCreate) -> Quest:
    if get_quest_by_date(db, payload.date):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Quest already exists for {payload.date.isoformat()}",
        )

    quest = Quest(title=payload.title, description=payload.description, date=payload.date)
    quest.tasks = [
        QuestTask(description=task.description, points=task.points) for task in payload.tasks
    ]
    db.add(quest)
    db.commit()
    db.refresh(quest)
    return get_quest(db, quest.id)


def update_quest(db: Session, quest: Quest, payload: QuestUpdate) -> Quest:
    if payload.date is not None and payload.date != quest.date:
        existing = get_quest_by_date(db, payload.date)
        if existing and existing.id != quest.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Quest already exists for {payload.date.isoformat()}",
            )
        quest.date = payload.date

    if payload.title is not None:
        quest.title = payload.title
    if payload.description is not None:
        quest.description = payload.description

    if payload.tasks is not None:
        quest.tasks.clear()
        quest.tasks.extend(
            QuestTask(description=task.description, points=task.points) for task in payload.tasks
        )

    db.commit()
    db.refresh(quest)
    return get_quest(db, quest.id)


def delete_quest(db: Session, quest: Quest) -> None:
    db.delete(quest)
    db.commit()


def generate_daily_quest(db: Session, quest_date: date | None = None) -> Quest:
    quest_date = quest_date or date.today()
    existing = get_quest_by_date(db, quest_date)
    if existing:
        return existing

    quest = Quest(
        title=f"Daily Quest - {quest_date.isoformat()}",
        description="Complete today's tasks to earn points.",
        date=quest_date,
    )
    quest.tasks = [QuestTask(**task) for task in DEFAULT_DAILY_TASKS]
    db.add(quest)
    db.commit()
    db.refresh(quest)
    return get_quest(db, quest.id)
