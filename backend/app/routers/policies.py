# app/routers/policies.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models.lender_policy import Lender, LenderProgram, LenderPolicy
from app.schemas.lender_policy import (
    LenderCreate, LenderRead,
    LenderProgramCreate, LenderProgramRead,
    LenderPolicyCreate, LenderPolicyRead,
)

router = APIRouter()

@router.post("/lenders", response_model=LenderRead)
def create_lender(lender: LenderCreate, db: Session = Depends(get_db)):
    obj = Lender(**lender.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/lenders", response_model=List[LenderRead])
def list_lenders(db: Session = Depends(get_db)):
    return db.query(Lender).all()


@router.post("/programs", response_model=LenderProgramRead)
def create_program(program: LenderProgramCreate, db: Session = Depends(get_db)):
    obj = LenderProgram(**program.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/programs", response_model=List[LenderProgramRead])
def list_programs(db: Session = Depends(get_db)):
    return db.query(LenderProgram).all()


@router.post("/", response_model=LenderPolicyRead)
def create_policy(policy: LenderPolicyCreate, db: Session = Depends(get_db)):
    obj = LenderPolicy(
        lender_program_id=policy.lender_program_id,
        version=policy.version,
        is_active=policy.is_active,
        policy_json=policy.policy_json.dict(),
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/", response_model=List[LenderPolicyRead])
def list_policies(db: Session = Depends(get_db)):
    objs = db.query(LenderPolicy).all()
    return [
        LenderPolicyRead(
            id=o.id,
            lender_program_id=o.lender_program_id,
            version=o.version,
            is_active=o.is_active,
            policy_json=o.policy_json,
        )
        for o in objs
    ]


@router.put("/{policy_id}", response_model=LenderPolicyRead)
def update_policy(policy_id: int, policy: LenderPolicyCreate, db: Session = Depends(get_db)):
    obj = db.query(LenderPolicy).filter(LenderPolicy.id == policy_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Policy not found")
    obj.lender_program_id = policy.lender_program_id
    obj.version = policy.version
    obj.is_active = policy.is_active
    obj.policy_json = policy.policy_json.dict()
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/all")
def delete_all_policies(db: Session = Depends(get_db)):
    db.query(LenderPolicy).delete()
    db.commit()
    return {"status": "ok", "message": "All policies deleted"}
