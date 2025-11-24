# app/routers/applications.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.db import get_db
from app.models.borrower import Borrower
from app.models.guarantor import Guarantor
from app.models.loan_request import LoanRequest
from app.schemas.borrower import BorrowerCreate, BorrowerRead
from app.schemas.guarantor import GuarantorCreate, GuarantorRead
from app.schemas.loan_request import LoanRequestBase, LoanRequestCreate, LoanRequestRead

router = APIRouter()

# app/routers/applications.py

@router.post("/", response_model=LoanRequestRead)
def create_application(
    payload: dict,
    db: Session = Depends(get_db),
):
    # Extract
    borrower_data = payload["borrower"]
    guarantors_data = payload["guarantors"]
    loan_data = payload["loan_request"]

    # 1. Create borrower
    borrower = Borrower(**borrower_data)
    db.add(borrower)
    db.flush()  # Get borrower.id

    # 2. Create guarantors
    for g in guarantors_data:
        guarantor = Guarantor(
            borrower_id=borrower.id,
            **g
        )
        db.add(guarantor)

    # 3. Create loan request
    loan = LoanRequest(
        borrower_id=borrower.id,
        amount=loan_data["amount"],
        term_months=loan_data["term_months"],
        equipment_type=loan_data["equipment_type"],
        equipment_cost=loan_data["equipment_cost"],
        equipment_year=loan_data.get("equipment_year"),
        equipment_vendor=loan_data.get("equipment_vendor"),
        equipment_condition=loan_data.get("equipment_condition"),
        created_at=date.today()
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)

    return loan

@router.get("/{loan_request_id}", response_model=LoanRequestRead)
def get_application(loan_request_id: int, db: Session = Depends(get_db)):
    lr = db.query(LoanRequest).filter(LoanRequest.id == loan_request_id).first()
    if not lr:
        raise HTTPException(status_code=404, detail="Loan request not found")
    return lr

@router.get("/", response_model=List[LoanRequestRead])
def list_applications(db: Session = Depends(get_db)):
    apps = db.query(LoanRequest).order_by(LoanRequest.id.desc()).all()
    return apps
