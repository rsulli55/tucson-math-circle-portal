from typing import Dict
from enum import Enum

from pydantic import BaseModel, Field, UUID4

from backend.main.db.mixins import PydanticObjectId, SessionLevel


class StudentMeetingCounter(BaseModel):
    attended: int = 0
    registered: int = 0
    # TODO: Add a validation that attended <= registered


class StudentMeetingRegistration(BaseModel):
    meeting_uuid: UUID4 = Field()
    attended: bool = False


class StudentGrade(str, Enum):
    pre_k = "PreK"
    k = "K"
    one = "1"
    two = "2"
    three = "3"
    four = "4"
    five = "5"
    six = "6"
    seven = "7"
    eight = "8"
    nine = "9"
    ten = "10"
    eleven = "11"
    twelve = "12"


class StudentCreateModel(BaseModel):
    first_name: str = Field()
    last_name: str = Field()
    grade: StudentGrade = Field()
    age: int = Field()


class StudentUpdateModel(StudentCreateModel):
    id: PydanticObjectId


class StudentModel(StudentCreateModel):
    profile_uuid: UUID4 = Field()
    # dictionary of the form (meeting uuid, attended (True/False))
    meetings_registered: Dict[UUID4, bool] = {}
    # meeting_counts is a convenience to track the number
    # of meetings registered and attended for each `SessionLevel`
    meeting_counts: Dict[SessionLevel, StudentMeetingCounter] = {
        SessionLevel.junior_a: StudentMeetingCounter(),
        SessionLevel.junior_b: StudentMeetingCounter(),
        SessionLevel.senior: StudentMeetingCounter(),
    }