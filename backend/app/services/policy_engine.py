# app/services/policy_engine.py
from typing import Any, Dict, List
from dataclasses import dataclass

from app.schemas.lender_policy import (
    PolicyJson,
    RuleConfig,
    RuleGroupConfig,
    ScoringConfig,
)
from app.schemas.underwriting import RuleResult, PolicyEvaluation


@dataclass
class ApplicationProfile:
    borrower: Dict[str, Any]
    guarantors: List[Dict[str, Any]]
    business_credit: Dict[str, Any] | None
    loan_request: Dict[str, Any]
    derived: Dict[str, Any]


def _get_field(obj: Dict[str, Any], path: str | None) -> Any:
    if not path:
        return None
    parts = path.split(".")
    cur: Any = obj
    for p in parts:
        if cur is None:
            return None
        if isinstance(cur, dict):
            cur = cur.get(p)
        else:
            return None
    return cur


def _resolve_field(app: ApplicationProfile, field: str | None) -> Any:
    """
    Field names are namespaced:
    - 'borrower.state'
    - 'loan.amount'
    - 'guarantor.primary.fico_score'
    - 'derived.foir'
    """
    if field is None:
        return None

    if field.startswith("borrower."):
        return _get_field(app.borrower, field[len("borrower."):])
    if field.startswith("loan."):
        return _get_field(app.loan_request, field[len("loan."):])
    if field.startswith("derived."):
        return _get_field(app.derived, field[len("derived."):])
    if field.startswith("guarantor.primary."):
        primary = app.guarantors[0] if app.guarantors else {}
        return _get_field(primary, field[len("guarantor.primary."):])
    if field.startswith("business_credit."):
        bc = app.business_credit or {}
        return _get_field(bc, field[len("business_credit."):])
    # fallback, treat as derived
    return _get_field(app.derived, field)


def eval_rule(rule: RuleConfig, app: ApplicationProfile) -> RuleResult:
    v = _resolve_field(app, rule.field)

    rule_type = rule.type.upper()
    p = rule.params

    def fail(expected=None) -> RuleResult:
        return RuleResult(
            rule_id=rule.id,
            passed=False,
            severity=rule.severity,
            message=rule.message,
            field=rule.field,
            expected=expected,
            actual=v,
        )

    def ok() -> RuleResult:
        return RuleResult(
            rule_id=rule.id,
            passed=True,
            severity=rule.severity,
            message="",
            field=rule.field,
            expected=None,
            actual=v,
        )

    if rule_type == "MIN_VALUE":
        if v is None or v < p["min"]:
            return fail(expected={">=": p["min"]})
        return ok()

    if rule_type == "MAX_VALUE":
        if v is None or v > p["max"]:
            return fail(expected={"<=": p["max"]})
        return ok()

    if rule_type == "IN_SET":
        allowed = set(p["allowed"])
        if v not in allowed:
            return fail(expected={"in": list(allowed)})
        return ok()

    if rule_type == "NOT_IN_SET":
        blocked = set(p["blocked"])
        if v in blocked:
            return fail(expected={"not_in": list(blocked)})
        return ok()

    if rule_type == "BOOLEAN_IS_TRUE":
        if not bool(v):
            return fail(expected=True)
        return ok()

    if rule_type == "RANGE":
        if v is None or not (p["min"] <= v <= p["max"]):
            return fail(expected={"between": [p["min"], p["max"]]})
        return ok()

    # Fallback, unknown rule type
    return RuleResult(
        rule_id=rule.id,
        passed=False,
        severity=rule.severity,
        message=f"Unknown rule type {rule.type}",
        field=rule.field,
        expected=None,
        actual=v,
    )


def eval_group(group: RuleGroupConfig, app: ApplicationProfile) -> List[RuleResult]:
    results: List[RuleResult] = []

    if group.rules:
        for r in group.rules:
            results.append(eval_rule(r, app))

    if group.groups:
        for g in group.groups:
            results.extend(eval_group(g, app))

    return results


def evaluate_policy(
    policy_json: PolicyJson,
    lender_id: int,
    lender_program_id: int,
    app: ApplicationProfile,
) -> PolicyEvaluation:

    hard_results = eval_group(policy_json.hard_rules, app)
    hard_fail = any((not r.passed) and r.severity == "HARD" for r in hard_results)

    soft_results: List[RuleResult] = []
    score: float | None = None

    if not hard_fail and policy_json.soft_rules:
        soft_results = eval_group(policy_json.soft_rules, app)
        score = _compute_score(policy_json.scoring_config, soft_results)
    elif not hard_fail:
        # no soft rules, treat as full score
        score = 100.0

    eligible = (not hard_fail) and (score is None or score >= policy_json.scoring_config.min_accept_score)

    reasons: List[str] = []
    if hard_fail:
        reasons.extend([r.message for r in hard_results if not r.passed and r.message])
    if not hard_fail and soft_results:
        reasons.extend([r.message for r in soft_results if not r.passed and r.message])

    return PolicyEvaluation(
        lender_id=lender_id,
        lender_program_id=lender_program_id,
        eligible=eligible,
        fit_score=score,
        hard_rule_results=hard_results,
        soft_rule_results=soft_results,
        reasons=reasons,
    )


def _compute_score(scoring: ScoringConfig, soft_results: List[RuleResult]) -> float:
    score = scoring.base_score
    rule_map = {r.rule_id: r for r in soft_results}
    for d in scoring.deductions:
        rid = d["ruleId"]
        pts = d["points"]
        r = rule_map.get(rid)
        if r and not r.passed:
            score -= pts
    return max(score, 0.0)
