# app/routers/underwriting.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.services.underwriting import run_underwriting
from app.models.match_result import MatchRun
from app.schemas.underwriting import MatchRunRead

router = APIRouter()

@router.post("/run/{loan_request_id}", response_model=MatchRunRead)
def initiate_underwriting(loan_request_id: int, db: Session = Depends(get_db)):
    # In a Hatchet world, this would enqueue a workflow and return run id
    match_run = run_underwriting(db, loan_request_id)
    return match_run


@router.get("/runs/{match_run_id}", response_model=MatchRunRead)
def get_run(match_run_id: int, db: Session = Depends(get_db)):
    mr = db.query(MatchRun).filter(MatchRun.id == match_run_id).first()
    if not mr:
        raise HTTPException(status_code=404, detail="Match run not found")
    return mr
