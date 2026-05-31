from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user, require_roles
from app.database import get_db
from app.schemas import Role
from app.quest_schemas import QuestCreate, QuestResponse, QuestUpdate
from app.services import quests as quest_service
from app.users import User

router = APIRouter(prefix="/quests", tags=["quests"])


@router.get("", response_model=list[QuestResponse])
def list_quests(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    quest_date: Annotated[date | None, Query(alias="date")] = None,
) -> list[QuestResponse]:
    return quest_service.list_quests(db, quest_date)


@router.get("/{quest_id}", response_model=QuestResponse)
def get_quest(
    quest_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> QuestResponse:
    quest = quest_service.get_quest(db, quest_id)
    if not quest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest not found")
    return quest


@router.post("", response_model=QuestResponse, status_code=status.HTTP_201_CREATED)
def create_quest(
    payload: QuestCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(Role.admin))],
) -> QuestResponse:
    return quest_service.create_quest(db, payload)


@router.put("/{quest_id}", response_model=QuestResponse)
def update_quest(
    quest_id: int,
    payload: QuestUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(Role.admin))],
) -> QuestResponse:
    quest = quest_service.get_quest(db, quest_id)
    if not quest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest not found")
    return quest_service.update_quest(db, quest, payload)


@router.delete("/{quest_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quest(
    quest_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_roles(Role.admin))],
) -> None:
    quest = quest_service.get_quest(db, quest_id)
    if not quest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest not found")
    quest_service.delete_quest(db, quest)
