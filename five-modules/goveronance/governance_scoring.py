from governance_rules import GOVERNANCE_CRITERIA


def calculate_module_score(findings):

    """
    Calculate weighted governance score
    """

    total_weight = 0
    weighted_sum = 0

    for finding in findings:

        # find weight from rules
        weight = next(
            c["weight"] for c in GOVERNANCE_CRITERIA
            if c["id"] == finding.criterion_id
        )

        weighted_sum += finding.score * weight
        total_weight += weight

    if total_weight == 0:
        return 0

    return round(weighted_sum / total_weight, 3)


def determine_severity(score):

    """
    Map numeric score → governance severity
    """

    if score >= 0.75:
        return "PASS"

    elif score >= 0.5:
        return "SIGNIFICANT_DEFICIENCY"

    else:
        return "MATERIAL_WEAKNESS"


def determine_risk_level(score):

    """
    Convert score → risk level
    """

    if score >= 0.75:
        return "low"

    elif score >= 0.5:
        return "medium"

    else:
        return "high"
