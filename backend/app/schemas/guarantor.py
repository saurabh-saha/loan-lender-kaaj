# app/schemas/guarantor.py
from pydantic import BaseModel
from typing import Optional

class GuarantorBase(BaseModel):
    name: str
    fico_score: Optional[int] = None
    bankruptcy_flag: bool = False
    delinquency_flag: bool = False


class GuarantorCreate(GuarantorBase):
    borrower_id: int


class GuarantorRead(GuarantorBase):
    id: int
    borrower_id: int

    class Config:
        orm_mode = True
