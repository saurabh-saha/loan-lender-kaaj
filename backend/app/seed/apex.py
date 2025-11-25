from app.db import SessionLocal
from app.models.lender_policy import Lender, LenderProgram, LenderPolicy


def seed_apex():
    db = SessionLocal()
    # Skip if seeded
    existing = db.query(Lender).filter(Lender.name == "Apex Equipment Finance").first()
    if existing:
        print("Apex already seeded — skipping.")
        return

    # -----------------------------
    # 1. Create Apex Lender
    # -----------------------------
    apex = Lender(name="Apex Equipment Finance", active=True)
    db.add(apex)
    db.flush()

    def add_program(name, min_amt, max_amt, min_term, max_term, policy_json):
        program = LenderProgram(
            lender_id=apex.id,
            name=name,
            min_amount=min_amt,
            max_amount=max_amt,
            min_term_months=min_term,
            max_term_months=max_term
        )
        db.add(program)
        db.flush()

        policy = LenderPolicy(
            lender_program_id=program.id,
            version=1,
            is_active=True,
            policy_json=policy_json
        )
        db.add(policy)

    # ------------------------------------------------------
    # PROGRAM 1 — Standard A
    # ------------------------------------------------------
    policy_A = {
        "hard_rules": {
            "logic": "ALL",
            "rules": [
                {"id": "fico_650", "type": "MIN_VALUE",
                 "field": "guarantors[0].fico_score",
                 "params": {"min": 650}, "severity": "HARD",
                 "message": "FICO must be 650+"},
                {"id": "tib_5yrs", "type": "MIN_VALUE",
                 "field": "borrower.years_in_business",
                 "params": {"min": 5}, "severity": "HARD",
                 "message": "5+ years in business"},
            ]
        },
        "soft_rules": {
            "logic": "ALL",
            "rules": [
                {"id": "ideal_fico_700", "type": "MIN_VALUE",
                 "field": "guarantors[0].fico_score",
                 "params": {"min": 700}, "severity": "SOFT",
                 "message": "Ideal FICO 700+"}
            ]
        },
        "scoring_config": {
            "base_score": 100,
            "min_accept_score": 60,
            "deductions": [{"ruleId": "ideal_fico_700", "points": 10}]
        }
    }

    add_program("Standard A", 10000, 500000, 24, 60, policy_A)

    # ------------------------------------------------------
    # PROGRAM 2 — Standard B
    # ------------------------------------------------------
    policy_B = {
        "hard_rules": {
            "logic": "ALL",
            "rules": [
                {"id": "fico_670", "type": "MIN_VALUE",
                 "field": "guarantors[0].fico_score",
                 "params": {"min": 670}, "severity": "HARD",
                 "message": "FICO must be 670+"},
                {"id": "tib_3yrs", "type": "MIN_VALUE",
                 "field": "borrower.years_in_business",
                 "params": {"min": 3}, "severity": "HARD",
                 "message": "3+ years in business"},
            ]
        },
        "soft_rules": {
            "logic": "ALL",
            "rules": [
                {"id": "ideal_fico_700", "type": "MIN_VALUE",
                 "field": "guarantors[0].fico_score",
                 "params": {"min": 700}, "severity": "SOFT",
                 "message": "Ideal FICO 700+"}
            ]
        },
        "scoring_config": {
            "base_score": 100,
            "min_accept_score": 60,
            "deductions": [{"ruleId": "ideal_fico_700", "points": 10}]
        }
    }

    add_program("Standard B", 10000, 250000, 24, 60, policy_B)

    # ------------------------------------------------------
    # PROGRAM 3 — Standard C
    # ------------------------------------------------------
    policy_C = {
        "hard_rules": {
            "logic": "ALL",
            "rules": [
                {"id": "fico_640", "type": "MIN_VALUE",
                 "field": "guarantors[0].fico_score",
                 "params": {"min": 640}, "severity": "HARD",
                 "message": "FICO must be 640+"},
                {"id": "tib_2yrs", "type": "MIN_VALUE",
                 "field": "borrower.years_in_business",
                 "params": {"min": 2}, "severity": "HARD",
                 "message": "2+ years in business"},
            ]
        },
        "soft_rules": {"logic": "ALL", "rules": []},
        "scoring_config": {
            "base_score": 100,
            "min_accept_score": 50,
            "deductions": []
        }
    }

    add_program("Standard C", 10000, 100000, 24, 60, policy_C)

    # ------------------------------------------------------
    # PROGRAM 4 — Medical A
    # ------------------------------------------------------
    policy_medA = {
        "hard_rules": {
            "logic": "ALL",
            "rules": [
                {"id": "medical_fico_700", "type": "MIN_VALUE",
                 "field": "guarantors[0].fico_score",
                 "params": {"min": 700}, "severity": "HARD",
                 "message": "Medical FICO 700+"},
                {"id": "time_licensed_5yrs", "type": "MIN_VALUE",
                 "field": "borrower.years_in_business",
                 "params": {"min": 5}, "severity": "HARD",
                 "message": "5 years licensed"},
            ]
        },
        "soft_rules": {"logic": "ALL", "rules": []},
        "scoring_config": {
            "base_score": 100,
            "min_accept_score": 65,
            "deductions": []
        }
    }

    add_program("Medical A", 10000, 500000, 24, 60, policy_medA)

    # ------------------------------------------------------
    # PROGRAM 5 — Medical B
    # ------------------------------------------------------
    policy_medB = {
        "hard_rules": {
            "logic": "ALL",
            "rules": [
                {"id": "medical_fico_670", "type": "MIN_VALUE",
                 "field": "guarantors[0].fico_score",
                 "params": {"min": 670}, "severity": "HARD",
                 "message": "FICO must be 670+"},
                {"id": "time_licensed_2yrs", "type": "MIN_VALUE",
                 "field": "borrower.years_in_business",
                 "params": {"min": 2}, "severity": "HARD",
                 "message": "2 years licensed"},
            ]
        },
        "soft_rules": {"logic": "ALL", "rules": []},
        "scoring_config": {
            "base_score": 100,
            "min_accept_score": 60,
            "deductions": []
        }
    }

    add_program("Medical B", 10000, 250000, 24, 60, policy_medB)

    # ------------------------------------------------------
    # PROGRAM 6 — A+ Prime
    # ------------------------------------------------------
    policy_Aplus = {
        "hard_rules": {
            "logic": "ALL",
            "rules": [
                {"id": "fico_720", "type": "MIN_VALUE",
                 "field": "guarantors[0].fico_score",
                 "params": {"min": 720}, "severity": "HARD",
                 "message": "FICO must be 720+"},
                {"id": "tib_5yrs", "type": "MIN_VALUE",
                 "field": "borrower.years_in_business",
                 "params": {"min": 5}, "severity": "HARD",
                 "message": "5+ years in business"},
            ]
        },
        "soft_rules": {"logic": "ALL", "rules": []},
        "scoring_config": {
            "base_score": 100,
            "min_accept_score": 75,
            "deductions": []
        }
    }

    add_program("A+ Prime Program", 10000, 500000, 24, 60, policy_Aplus)

    # -----------------------------------------
    # COMMIT ALL
    # -----------------------------------------
    db.commit()
    print("Apex seed inserted successfully!")
    db.close()


# ----------------------------------------------------
# RUN DIRECTLY: python -m app.seeds.apex
# ----------------------------------------------------
def main():
    
    seed_apex()


if __name__ == "__main__":
    main()
