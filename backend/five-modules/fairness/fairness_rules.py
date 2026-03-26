# fairness_rules.py

FAIRNESS_CRULES = [

    {
        "criterion_id": "F2.1",

        "description": "Fairness Metrics & Special Category Data compliance under GDPR Article 9.",

        "check_methods": [
            "Evaluate demographic parity difference between groups",
            "Evaluate disparate impact ratio",
            "Verify legal basis for special category data processing",
            "Check consent collection and withdrawal mechanisms"
        ],

        "pass_criteria": [
            "Demographic parity difference ≤ 5%",
            "Disparate impact between 0.8 and 1.25",
            "Legal basis documented for special category data",
            "Consent records and withdrawal mechanisms exist"
        ],

        "evidence_requirements": {
            "legal_basis": "Documentation specifying GDPR Article 9 legal basis",
            "consent_records": "Logs or records of user consent",
            "consent_withdrawal": "Procedure for withdrawing consent",
            "data_category_definition": "Definition of special category data"
        },

        "scoring_methodology": {
            "weight": 0.35,
            "thresholds": {
                "1.0": "Full compliance with legal basis, consent, and fairness metrics",
                "0.75": "Legal basis present with minor gaps",
                "0.5": "Partial documentation",
                "0.0": "No legal basis or fairness validation"
            }
        }
    },

    {
        "criterion_id": "F2.2",

        "description": "Bias Monitoring System effectiveness.",

        "check_methods": [
            "Check monitoring frequency",
            "Check alert mechanisms",
            "Evaluate response time to bias incidents"
        ],

        "pass_criteria": [
            "Monitoring occurs at least monthly",
            "Alert response time ≤ 72 hours",
            "Monitoring process is documented"
        ],

        "evidence_requirements": {
            "monitoring_logs": "Logs showing periodic bias monitoring",
            "alert_records": "Records of bias alerts and response times",
            "monitoring_policy": "Documentation of monitoring procedures"
        },

        "scoring_methodology": {
            "weight": 0.25,
            "thresholds": {
                "1.0": "Continuous monitoring with automated alerts",
                "0.75": "Regular monitoring with defined process",
                "0.5": "Ad-hoc monitoring",
                "0.0": "No monitoring system"
            }
        }
    },

    {
        "criterion_id": "F2.3",

        "description": "Bias Mitigation Procedures implementation.",

        "check_methods": [
            "Check number of mitigation techniques",
            "Evaluate effectiveness validation",
            "Verify documentation"
        ],

        "pass_criteria": [
            "At least 2 mitigation techniques implemented",
            "Effectiveness of mitigation is validated",
            "Procedures are documented"
        ],

        "evidence_requirements": {
            "mitigation_methods": "List of bias mitigation techniques used",
            "validation_results": "Evidence of effectiveness validation",
            "procedure_docs": "Documentation of mitigation procedures"
        },

        "scoring_methodology": {
            "weight": 0.25,
            "thresholds": {
                "1.0": "Multiple validated mitigation techniques",
                "0.75": "Mitigation implemented but limited validation",
                "0.5": "Partial mitigation",
                "0.0": "No mitigation"
            }
        }
    },

    {
        "criterion_id": "F2.4",

        "description": "Automated Decision-Making Opt-Out (GDPR Article 22 / CCPA).",

        "check_methods": [
            "Check opt-out mechanism",
            "Check human review availability",
            "Check privacy policy disclosure",
            "Check alternative decision process"
        ],

        "pass_criteria": [
            "Opt-out mechanism is operational",
            "Human review available within 5 business days",
            "Privacy policy discloses AI decision-making",
            "Alternative process exists"
        ],

        "evidence_requirements": {
            "opt_out_docs": "Documentation of opt-out procedures",
            "review_logs": "Human review request logs",
            "privacy_policy": "Privacy policy disclosure",
            "alternative_process": "Non-AI decision workflow"
        },

        "scoring_methodology": {
            "weight": 0.15,
            "thresholds": {
                "1.0": "Fully compliant opt-out + human review",
                "0.75": "Partial compliance",
                "0.5": "Limited process",
                "0.0": "No opt-out or review mechanism"
            }
        }
    }

]
