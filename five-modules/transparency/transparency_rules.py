TRANSPARENCY_CRITERIA = [

    {
        "criterion_id": "E4.1",

        "description": "AI Decision Explainability & GDPR Transparency (Articles 13–14).",

        "check_methods": [
            "Check presence of SHAP or LIME explanations",
            "Evaluate feature importance availability",
            "Verify decision traceability to source data",
            "Assess coverage of explainability across decisions",
            "Check for plain language explanations",
            "Verify disclosure of logic, significance, and consequences"
        ],

        "pass_criteria": [
            "SHAP/LIME explanations available for ≥95% of decisions",
            "Feature importance documented",
            "Decision traceability implemented",
            "Plain language explanations provided",
            "Logic, significance, and consequences disclosed"
        ],

        "evidence_requirements": {
            "explainability_outputs": "SHAP/LIME outputs or explanation artifacts",
            "feature_importance": "Feature importance documentation",
            "traceability_logs": "Logs linking decisions to input data",
            "plain_language_examples": "User-facing explanation samples",
            "gdpr_disclosure": "Documentation of logic, significance, and consequences"
        },

        "scoring_methodology": {
            "weight": 0.30,
            "thresholds": {
                "1.0": "Comprehensive explainability with full GDPR-compliant disclosures",
                "0.75": "Explainability implemented with minor gaps",
                "0.5": "Partial explainability or missing plain language",
                "0.0": "No explainability or transparency"
            }
        }
    },

    {
        "criterion_id": "E4.2",

        "description": "Audit Trail Completeness and Integrity.",

        "check_methods": [
            "Verify logging of all AI decisions",
            "Check retention period",
            "Evaluate immutability of logs",
            "Check audit trail accessibility"
        ],

        "pass_criteria": [
            "100% of decisions logged",
            "Logs retained for ≥7 years",
            "Logs are immutable",
            "Audit trail is accessible for review"
        ],

        "evidence_requirements": {
            "decision_logs": "Logs of model decisions",
            "retention_policy": "Data retention documentation",
            "immutability_mechanism": "Evidence of immutable storage (e.g., blockchain, WORM)",
            "audit_access": "Audit trail access records"
        },

        "scoring_methodology": {
            "weight": 0.30,
            "thresholds": {
                "1.0": "Complete, immutable audit trail with full retention",
                "0.75": "Comprehensive logging with minor gaps",
                "0.5": "Partial logging or retention issues",
                "0.0": "No audit trail or incomplete logs"
            }
        }
    },

    {
        "criterion_id": "E4.3",

        "description": "Model Documentation and Version Control.",

        "check_methods": [
            "Check existence of model cards",
            "Evaluate completeness of documentation",
            "Verify version control system",
            "Check documentation updates"
        ],

        "pass_criteria": [
            "Model cards include required sections",
            "Documentation is complete and up-to-date",
            "Version control is operational",
            "Changes are tracked"
        ],

        "evidence_requirements": {
            "model_cards": "Model documentation artifacts",
            "version_control_logs": "Git or versioning system logs",
            "documentation_records": "Model documentation updates",
            "change_logs": "Records of model updates"
        },

        "scoring_methodology": {
            "weight": 0.20,
            "thresholds": {
                "1.0": "Comprehensive model documentation with full version control",
                "0.75": "Good documentation with minor gaps",
                "0.5": "Partial documentation or weak version control",
                "0.0": "No documentation or version control"
            }
        }
    },

    {
        "criterion_id": "E4.4",

        "description": "Human Review Mechanism (GDPR Article 22).",

        "check_methods": [
            "Check availability of human intervention",
            "Evaluate reviewer qualifications",
            "Assess response timelines",
            "Verify contestation process"
        ],

        "pass_criteria": [
            "Human review available upon request",
            "Reviewers are trained",
            "Response time ≤ 5 business days",
            "Users can contest decisions"
        ],

        "evidence_requirements": {
            "review_procedure": "Human review procedures",
            "training_records": "Reviewer training documentation",
            "review_logs": "Logs of review requests and response times",
            "contestation_process": "Appeal or contestation workflow"
        },

        "scoring_methodology": {
            "weight": 0.10,
            "thresholds": {
                "1.0": "Fully operational human review system",
                "0.75": "Review process exists with minor gaps",
                "0.5": "Limited review capability",
                "0.0": "No human review mechanism"
            }
        }
    },

    {
        "criterion_id": "E4.5",

        "description": "CCPA Opt-Out and Right to Know.",

        "check_methods": [
            "Check privacy policy disclosure",
            "Verify opt-out mechanism",
            "Evaluate request handling timelines",
            "Check access to decision logic"
        ],

        "pass_criteria": [
            "Privacy policy discloses AI usage",
            "Opt-out mechanism is operational",
            "Requests handled within 45 days",
            "Users can access decision logic"
        ],

        "evidence_requirements": {
            "privacy_policy": "Privacy policy documentation",
            "opt_out_mechanism": "Opt-out implementation",
            "request_logs": "Consumer request handling logs",
            "logic_access_docs": "Documentation of logic disclosure"
        },

        "scoring_methodology": {
            "weight": 0.10,
            "thresholds": {
                "1.0": "Full CCPA compliance with opt-out and transparency",
                "0.75": "Mostly compliant with minor gaps",
                "0.5": "Partial compliance",
                "0.0": "No opt-out or transparency"
            }
        }
    }

]
