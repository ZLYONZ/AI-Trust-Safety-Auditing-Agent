PERFORMANCE_CRITERIA = [

    {
        "criterion_id": "A5.1",

        "description": "Model Validation & Data Accuracy (including GDPR Article 5(1)(d) data accuracy).",

        "check_methods": [
            "Verify confusion matrix, ROC/PR metrics",
            "Check holdout validation size (≥20%)",
            "Evaluate overall model accuracy",
            "Assess validation of personal data inference accuracy",
            "Check ground truth comparison",
            "Review correction request analysis for systematic errors"
        ],

        "pass_criteria": [
            "Confusion matrix and ROC/PR metrics documented",
            "Holdout dataset ≥20%",
            "Model accuracy ≥95%",
            "Personal data inference accuracy validated",
            "Ground truth comparison performed",
            "Systematic error analysis conducted"
        ],

        "evidence_requirements": {
            "validation_report": "Model validation report with metrics",
            "holdout_data": "Documentation of holdout dataset",
            "accuracy_metrics": "Accuracy, precision, recall, FPR",
            "inference_validation": "Validation of AI-generated personal data",
            "ground_truth": "Ground truth comparison results",
            "error_analysis": "Correction request analysis for systematic issues"
        },

        "scoring_methodology": {
            "weight": 0.30,
            "thresholds": {
                "1.0": "Comprehensive validation with high accuracy and personal data validation",
                "0.75": "Strong validation with minor gaps",
                "0.5": "Partial validation or missing personal data accuracy checks",
                "0.0": "No validation or unreliable accuracy"
            }
        }
    },

    {
        "criterion_id": "A5.2",

        "description": "Drift Monitoring with GDPR Accuracy Degradation Triggers.",

        "check_methods": [
            "Check frequency of drift monitoring",
            "Verify alert thresholds (5% / 10% / 15%)",
            "Assess detection of data and concept drift",
            "Evaluate impact of drift on personal data accuracy",
            "Check automated correction or retraining triggers"
        ],

        "pass_criteria": [
            "Drift monitoring occurs daily",
            "Alert thresholds defined (5%, 10%, 15%)",
            "Drift detection implemented",
            "Impact on personal data accuracy assessed",
            "Automated retraining or correction procedures exist"
        ],

        "evidence_requirements": {
            "monitoring_logs": "Drift monitoring logs",
            "alert_thresholds": "Defined drift thresholds",
            "drift_reports": "Drift detection reports",
            "accuracy_impact": "Assessment of drift impact on accuracy",
            "retraining_triggers": "Automated retraining or correction triggers"
        },

        "scoring_methodology": {
            "weight": 0.30,
            "thresholds": {
                "1.0": "Continuous drift monitoring with automated retraining triggers",
                "0.75": "Regular monitoring with defined thresholds",
                "0.5": "Ad-hoc monitoring or incomplete drift detection",
                "0.0": "No drift monitoring system"
            }
        }
    },

    {
        "criterion_id": "A5.3",

        "description": "Performance Dashboard & Materiality Assessment.",

        "check_methods": [
            "Check existence of performance dashboards",
            "Verify update frequency",
            "Evaluate displayed metrics (accuracy, error rate)",
            "Check materiality calculation implementation",
            "Assess visualization of risk and impact"
        ],

        "pass_criteria": [
            "Dashboard exists and accessible",
            "Updated daily",
            "Key metrics displayed (accuracy, error rate)",
            "Materiality calculation implemented",
            "Risk and impact clearly visualized"
        ],

        "evidence_requirements": {
            "dashboard_screenshots": "Performance dashboard outputs",
            "refresh_logs": "Dashboard refresh frequency logs",
            "metric_definitions": "Definitions of displayed metrics",
            "materiality_model": "Materiality calculation documentation",
            "risk_visualization": "Visualization of risk and impact"
        },

        "scoring_methodology": {
            "weight": 0.15,
            "thresholds": {
                "1.0": "Comprehensive dashboard with materiality analysis",
                "0.75": "Functional dashboard with minor gaps",
                "0.5": "Limited dashboard or missing materiality",
                "0.0": "No monitoring dashboard"
            }
        }
    },

    {
        "criterion_id": "A5.4",

        "description": "Personal Data Inference Accuracy (GDPR Article 5(1)(d)).",

        "check_methods": [
            "Evaluate validation of AI-generated personal data",
            "Check representative sample testing",
            "Assess accuracy metrics (precision, recall, FPR)",
            "Verify ground truth comparison",
            "Review correction request analysis for systematic patterns"
        ],

        "pass_criteria": [
            "Inference accuracy ≥95%",
            "Representative samples tested",
            "Accuracy metrics documented",
            "Ground truth comparison conducted",
            "Systematic issues identified and addressed"
        ],

        "evidence_requirements": {
            "inference_reports": "Reports on personal data inference accuracy",
            "sampling_methodology": "Sampling and testing methodology",
            "metrics": "Precision, recall, FPR metrics",
            "ground_truth_data": "Ground truth comparison data",
            "correction_analysis": "Analysis of correction requests"
        },

        "scoring_methodology": {
            "weight": 0.15,
            "thresholds": {
                "1.0": "Fully validated personal data accuracy with continuous monitoring",
                "0.75": "Strong validation with minor gaps",
                "0.5": "Partial validation or missing systematic analysis",
                "0.0": "No validation of personal data inference accuracy"
            }
        }
    },

    {
        "criterion_id": "A5.5",

        "description": "Data Subject Correction Rights & Retraining Governance (GDPR Article 16 / CCPA §1798.106).",

        "check_methods": [
            "Check correction request procedures",
            "Verify response timelines (30/45 days)",
            "Assess systematic error detection mechanisms",
            "Evaluate retraining triggers from correction patterns",
            "Check user notification process"
        ],

        "pass_criteria": [
            "Correction procedures documented",
            "≥95% requests handled within statutory timelines",
            "Systematic error detection implemented",
            "Retraining triggered when necessary",
            "Users notified of outcomes"
        ],

        "evidence_requirements": {
            "correction_procedures": "Correction request process documentation",
            "request_logs": "Logs with turnaround times",
            "error_detection": "Systematic error detection methodology",
            "retraining_records": "Retraining trigger documentation",
            "notification_records": "User notification logs"
        },

        "scoring_methodology": {
            "weight": 0.10,
            "thresholds": {
                "1.0": "Fully compliant correction and retraining governance",
                "0.75": "Mostly compliant with minor gaps",
                "0.5": "Partial compliance",
                "0.0": "No correction or retraining process"
            }
        }
    }

]
