from performance_rules import PERFORMANCE_CRITERIA


def calculate_module_score(findings):
    """
    Calculate weighted performance score
    """

    total_weight = 0
    weighted_sum = 0

    for finding in findings:

        # find weight from rules
        weight = next(
            c["scoring_methodology"]["weight"] for c in PERFORMANCE_CRITERIA
            if c["criterion_id"] == finding.criterion_id
        )

        weighted_sum += finding.score * weight
        total_weight += weight

    if total_weight == 0:
        return 0

    return round(weighted_sum / total_weight, 3)


def determine_severity(score):
    """
    Map numeric score → performance severity
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
