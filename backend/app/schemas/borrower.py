# app/schemas/borrower.py
from pydantic import BaseModel
from typing import Optional

class BorrowerBase(BaseModel):
    business_name: str
    industry: str
    state: str
    years_in_business: float
    annual_revenue: float


class BorrowerCreate(BorrowerBase):
    pass


class BorrowerRead(BorrowerBase):
    id: int

    class Config:
        orm_mode = True
