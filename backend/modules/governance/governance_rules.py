GOVERNANCE_CRITERIA = [

    {
        "criterion_id": "G1.1",

        "description": "AI Governance Policy (ISO 42001 Alignment).",

        "check_methods": [
            "Check existence of board-approved AI governance policy",
            "Verify inclusion of key policy sections (risk, privacy, accountability, compliance)",
            "Evaluate alignment with ISO 42001",
            "Check governance roles and responsibilities",
            "Assess policy review frequency"
        ],

        "pass_criteria": [
            "Board-approved AI governance policy exists",
            "Policy includes at least 7 key sections",
            "Roles and responsibilities are clearly defined",
            "Policy aligns with ISO 42001",
            "Policy reviewed at least annually"
        ],

        "evidence_requirements": {
            "policy_document": "AI governance policy document",
            "board_approval": "Board approval records",
            "policy_sections": "Policy structure and sections",
            "role_definitions": "Governance roles documentation",
            "review_logs": "Policy review records"
        },

        "scoring_methodology": {
            "weight": 0.20,
            "thresholds": {
                "1.0": "Comprehensive governance policy fully aligned with ISO 42001",
                "0.75": "Well-defined policy with minor gaps",
                "0.5": "Partial policy coverage",
                "0.0": "No formal governance policy"
            }
        }
    },

    {
        "criterion_id": "G1.2",

        "description": "AI Risk Management System (NIST AI RMF Alignment).",

        "check_methods": [
            "Identify documented AI risks",
            "Evaluate risk assessment methodology",
            "Check risk mitigation controls",
            "Verify monitoring frequency",
            "Assess alignment with NIST AI RMF"
        ],

        "pass_criteria": [
            "At least 5 AI risks documented",
            "Risk assessment methodology defined",
            "Mitigation controls implemented",
            "Quarterly risk monitoring conducted",
            "Aligned with NIST AI RMF"
        ],

        "evidence_requirements": {
            "risk_register": "AI risk register",
            "risk_assessment_docs": "Risk assessment methodology",
            "control_mechanisms": "Risk mitigation controls",
            "monitoring_reports": "Risk monitoring reports",
            "framework_mapping": "Mapping to NIST AI RMF"
        },

        "scoring_methodology": {
            "weight": 0.18,
            "thresholds": {
                "1.0": "Comprehensive risk management aligned with NIST AI RMF",
                "0.75": "Robust risk framework with minor gaps",
                "0.5": "Partial risk management",
                "0.0": "No risk management system"
            }
        }
    },

    {
        "criterion_id": "G1.3",

        "description": "SOX 404 Control Documentation and Testing.",

        "check_methods": [
            "Check number of documented controls",
            "Verify COSO framework mapping",
            "Evaluate control testing frequency",
            "Assess documentation completeness"
        ],

        "pass_criteria": [
            "At least 10 controls documented",
            "Controls mapped to COSO framework",
            "Quarterly testing performed",
            "Control documentation is complete"
        ],

        "evidence_requirements": {
            "control_docs": "SOX control documentation",
            "coso_mapping": "COSO framework mapping",
            "testing_reports": "Control testing results",
            "control_logs": "Control execution logs"
        },

        "scoring_methodology": {
            "weight": 0.18,
            "thresholds": {
                "1.0": "Comprehensive SOX control framework with regular testing",
                "0.75": "Strong controls with minor gaps",
                "0.5": "Partial controls or weak testing",
                "0.0": "No SOX controls documented"
            }
        }
    },

    {
        "criterion_id": "G1.4",

        "description": "AI System Inventory and Documentation.",

        "check_methods": [
            "Verify existence of AI system inventory",
            "Check completeness of system documentation",
            "Evaluate update frequency",
            "Assess coverage of all AI systems"
        ],

        "pass_criteria": [
            "All AI systems are documented",
            "Inventory is complete",
            "Updated at least quarterly",
            "System ownership and purpose documented"
        ],

        "evidence_requirements": {
            "system_inventory": "AI system inventory list",
            "system_docs": "System documentation",
            "update_logs": "Inventory update records",
            "ownership_records": "System ownership documentation"
        },

        "scoring_methodology": {
            "weight": 0.12,
            "thresholds": {
                "1.0": "Complete and up-to-date inventory",
                "0.75": "Mostly complete with minor gaps",
                "0.5": "Partial inventory",
                "0.0": "No system inventory"
            }
        }
    },

    {
        "criterion_id": "G1.5",

        "description": "Training & Competency in AI Governance.",

        "check_methods": [
            "Check percentage of trained personnel",
            "Evaluate training content relevance",
            "Verify assessment pass rates",
            "Check training frequency"
        ],

        "pass_criteria": [
            "At least 80% personnel trained",
            "Assessment pass rate ≥85%",
            "Training content covers AI governance",
            "Training conducted regularly"
        ],

        "evidence_requirements": {
            "training_records": "Training completion records",
            "assessment_results": "Training assessment results",
            "training_materials": "Training content",
            "attendance_logs": "Training attendance logs"
        },

        "scoring_methodology": {
            "weight": 0.12,
            "thresholds": {
                "1.0": "Comprehensive training with high coverage and performance",
                "0.75": "Strong training program with minor gaps",
                "0.5": "Limited training coverage",
                "0.0": "No training program"
            }
        }
    },

    {
        "criterion_id": "G1.6",

        "description": "ROPA Maintenance (GDPR Article 30).",

        "check_methods": [
            "Check documentation of processing activities",
            "Verify inclusion of required GDPR fields",
            "Check retention and update frequency",
            "Verify DPO review",
            "Assess completeness of records"
        ],

        "pass_criteria": [
            "All AI processing activities documented",
            "All required fields present (purpose, categories, recipients, retention, legal basis)",
            "Updated within 12 months",
            "DPO reviewed if applicable"
        ],

        "evidence_requirements": {
            "ropa_records": "Record of Processing Activities",
            "data_fields": "GDPR Article 30 required fields",
            "retention_policy": "Retention documentation",
            "dpo_review_logs": "DPO review evidence",
            "update_logs": "ROPA update records"
        },

        "scoring_methodology": {
            "weight": 0.10,
            "thresholds": {
                "1.0": "Complete ROPA with all fields and recent updates",
                "0.75": "ROPA complete with minor gaps",
                "0.5": "Partial ROPA coverage",
                "0.0": "No ROPA documentation"
            }
        }
    },

    {
        "criterion_id": "G1.7",

        "description": "High-Risk AI DPIA Governance (GDPR Article 35).",

        "check_methods": [
            "Check existence of DPIA procedures",
            "Verify DPO consultation",
            "Evaluate governance committee involvement",
            "Assess remediation tracking"
        ],

        "pass_criteria": [
            "DPIA procedures documented",
            "DPO consulted for high-risk AI",
            "Governance committee reviews DPIAs",
            "Findings tracked and remediated"
        ],

        "evidence_requirements": {
            "dpia_procedures": "DPIA governance procedures",
            "dpo_logs": "DPO consultation logs",
            "committee_records": "Governance committee reviews",
            "remediation_logs": "Remediation tracking records"
        },

        "scoring_methodology": {
            "weight": 0.10,
            "thresholds": {
                "1.0": "Full DPIA governance with strong oversight and remediation",
                "0.75": "DPIA process with minor gaps",
                "0.5": "Partial DPIA governance",
                "0.0": "No DPIA governance"
            }
        }
    }

]
