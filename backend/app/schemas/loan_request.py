# app/schemas/loan_request.py
from pydantic import BaseModel
from datetime import date

class LoanRequestBase(BaseModel):
    borrower_id: int
    amount: float
    term_months: int
    equipment_type: str
    equipment_cost: float
    equipment_year: int | None = None
    equipment_vendor: str | None = None
    equipment_condition: str | None = None


class LoanRequestCreate(LoanRequestBase):
    created_at: date


class LoanRequestRead(LoanRequestBase):
    id: int
    created_at: date

    class Config:
        orm_mode = True
