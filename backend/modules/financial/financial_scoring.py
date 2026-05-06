from financial_rules import FINANCIAL_CRITERIA


def calculate_module_score(findings):
    """Calculate weighted financial controls score."""
    total_weight = 0
    weighted_sum = 0

    for finding in findings:
        weight = next(
            c["scoring_methodology"]["weight"] for c in FINANCIAL_CRITERIA
            if c["criterion_id"] == finding.criterion_id
        )
        weighted_sum += finding.score * weight
        total_weight += weight

    if total_weight == 0:
        return 0

    return round(weighted_sum / total_weight, 3)


def determine_severity(score):
    """Map numeric score to financial audit severity."""
    if score >= 0.75:
        return "PASS"
    elif score >= 0.5:
        return "SIGNIFICANT DEFICIENCY"
    elif score >= 0.25:
        return "CONTROL DEFICIENCY"
    else:
        return "MATERIAL WEAKNESS"


def determine_risk_level(score):
    """Convert score to risk level."""
    if score >= 0.75:
        return "low"
    elif score >= 0.5:
        return "medium"
    else:
        return "high"