from datetime import date as DateType

from pydantic import BaseModel, ConfigDict, Field


class QuestTaskBase(BaseModel):
    description: str
    points: int = Field(ge=0)


class QuestTaskCreate(QuestTaskBase):
    pass


class QuestTaskUpdate(BaseModel):
    description: str | None = None
    points: int | None = Field(default=None, ge=0)


class QuestTaskResponse(QuestTaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    quest_id: int


class QuestBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    date: DateType


class QuestCreate(QuestBase):
    tasks: list[QuestTaskCreate] = Field(default_factory=list)


class QuestUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    date: DateType | None = None
    tasks: list[QuestTaskCreate] | None = None


class QuestResponse(QuestBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tasks: list[QuestTaskResponse] = Field(default_factory=list)
