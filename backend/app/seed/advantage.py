from app.db import SessionLocal
from app.models.lender_policy import Lender, LenderProgram, LenderPolicy


def seed_advantage():
    db = SessionLocal()

    # Avoid duplicate seeds
    existing = db.query(Lender).filter(Lender.name == "Advantage+ Financing").first()
    if existing:
        print("Advantage+ already seeded — skipping.")
        return

    # -----------------------------
    # LENDER
    # -----------------------------
    adv = Lender(name="Advantage+ Financing", active=True)
    db.add(adv)
    db.flush()

    # -----------------------------
    # PROGRAM — Single Program (<= $75k)
    # -----------------------------
    program = LenderProgram(
        lender_id=adv.id,
        name="Standard Advantage+ Program",
        min_amount=10000,
        max_amount=75000,
        min_term_months=12,
        max_term_months=60
    )
    db.add(program)
    db.flush()

    # -----------------------------
    # POLICY — Based on PDF rules
    # -----------------------------
    policy_json = {
        "hard_rules": {
            "logic": "ALL",
            "rules": [
                {
                    "id": "min_fico_680",
                    "type": "MIN_VALUE",
                    "field": "guarantors[0].fico_score",
                    "params": {"min": 680},
                    "severity": "HARD",
                    "message": "Minimum FICO 680 required"
                },
                {
                    "id": "no_bankruptcies",
                    "type": "NOT_IN_LIST",
                    "field": "guarantors[0].bankruptcy_flag",
                    "params": {"list": [True]},
                    "severity": "HARD",
                    "message": "No bankruptcies allowed"
                },
                {
                    "id": "no_collections",
                    "type": "NOT_IN_LIST",
                    "field": "borrower.has_collections_3yr",
                    "params": {"list": [True]},
                    "severity": "HARD",
                    "message": "No collections or charge-offs in last 3 years"
                },
                {
                    "id": "min_tib_3yrs",
                    "type": "MIN_VALUE",
                    "field": "borrower.years_in_business",
                    "params": {"min": 3},
                    "severity": "HARD",
                    "message": "Minimum 3 years in business"
                },
                {
                    "id": "us_citizen_only",
                    "type": "IN_LIST",
                    "field": "borrower.citizenship_status",
                    "params": {"list": ["US_CITIZEN"]},
                    "severity": "HARD",
                    "message": "Only US citizens eligible"
                }
            ]
        },

        "soft_rules": {
            "logic": "ALL",
            "rules": [
                {
                    "id": "fico_700_startup",
                    "type": "MIN_VALUE",
                    "field": "guarantors[0].fico_score",
                    "params": {"min": 700},
                    "severity": "SOFT",
                    "message": "Ideal FICO 700+ for startups"
                }
            ]
        },

        "scoring_config": {
            "base_score": 100,
            "min_accept_score": 60,
            "deductions": [
                {"ruleId": "fico_700_startup", "points": 10}
            ]
        }
    }

    policy = LenderPolicy(
        lender_program_id=program.id,
        version=1,
        is_active=True,
        policy_json=policy_json
    )
    db.add(policy)

    db.commit()
    db.close()

    print("Advantage+ seed inserted successfully!")


def main():
    seed_advantage()


if __name__ == "__main__":
    main()
