FINANCIAL_CRITERIA = [

    {
        "criterion_id": "F6.1",

        "description": "Segregation of Duties (SoD) Controls.",

        "check_methods": [
            "Verify documented SoD policies covering incompatible functions",
            "Check that transaction initiation, authorization, recording, and custody are separated",
            "Assess SoD enforcement in user access roles and permissions",
            "Evaluate compensating controls where full SoD is not feasible",
            "Verify periodic SoD conflict review and remediation"
        ],

        "pass_criteria": [
            "Documented SoD policy covering all incompatible financial functions",
            "Access controls enforce SoD at system level",
            "SoD conflicts reviewed at least quarterly",
            "Compensating controls documented where SoD is impractical",
            "Remediation tracking for identified SoD violations"
        ],

        "evidence_requirements": {
            "sod_policy": "Segregation of duties policy document",
            "access_matrix": "User access matrix or role definitions",
            "conflict_review": "SoD conflict review records",
            "compensating_controls": "Documentation of compensating controls",
            "remediation_logs": "SoD violation remediation records"
        },

        "scoring_methodology": {
            "weight": 0.20,
            "thresholds": {
                "1.0": "Comprehensive SoD controls enforced at system level with regular reviews",
                "0.75": "SoD policy exists with minor gaps or inconsistent enforcement",
                "0.5": "Partial SoD controls or significant gaps in incompatible function separation",
                "0.25": "Minimal SoD awareness but largely unenforced",
                "0.0": "No SoD controls or policy documented"
            }
        }
    },

    {
        "criterion_id": "F6.2",

        "description": "Journal Entry Controls and Approval Workflows.",

        "check_methods": [
            "Verify that all journal entries require documented authorization",
            "Check existence of approval workflow for manual journal entries",
            "Assess controls over recurring and automated journal entries",
            "Evaluate audit trail completeness for all journal entry activity",
            "Check controls for period-end and year-end adjustment entries"
        ],

        "pass_criteria": [
            "All manual journal entries require documented approval",
            "Approval workflow enforced in system with dual authorization for material entries",
            "Recurring entries subject to periodic review and reauthorization",
            "Complete audit trail for all journal entry creation, modification, and posting",
            "Period-end entries subject to enhanced review procedures"
        ],

        "evidence_requirements": {
            "je_policy": "Journal entry authorization policy",
            "workflow_docs": "Approval workflow documentation or system configuration",
            "audit_trail": "Journal entry audit trail samples",
            "recurring_review": "Recurring entry review records",
            "period_end_controls": "Period-end control procedures"
        },

        "scoring_methodology": {
            "weight": 0.18,
            "thresholds": {
                "1.0": "All journal entries authorized with full audit trail and dual approval for material items",
                "0.75": "Strong journal entry controls with minor gaps",
                "0.5": "Partial controls — some entries lack required authorization",
                "0.25": "Basic approval process but inconsistently applied",
                "0.0": "No journal entry controls or authorization requirements"
            }
        }
    },

    {
        "criterion_id": "F6.3",

        "description": "Bank Reconciliation and Cash Controls.",

        "check_methods": [
            "Verify frequency and timeliness of bank reconciliations",
            "Check that reconciliations are performed by someone independent of cash handling",
            "Assess documentation and review/approval of reconciliations",
            "Evaluate controls over unreconciled items and aging of outstanding items",
            "Check controls over petty cash, imprest accounts, and EFT transactions"
        ],

        "pass_criteria": [
            "All bank accounts reconciled monthly within defined deadline",
            "Reconciliations performed by personnel independent of cash disbursement",
            "Reconciliations reviewed and approved by supervisor",
            "Unreconciled items followed up within 30 days",
            "EFT and electronic payment controls documented"
        ],

        "evidence_requirements": {
            "reconciliation_policy": "Bank reconciliation policy and procedures",
            "reconciliation_samples": "Sample completed bank reconciliations",
            "approval_records": "Reconciliation approval documentation",
            "aging_report": "Unreconciled items aging report",
            "eft_controls": "Electronic funds transfer control documentation"
        },

        "scoring_methodology": {
            "weight": 0.15,
            "thresholds": {
                "1.0": "All accounts reconciled monthly with independent review and timely resolution",
                "0.75": "Regular reconciliations with minor gaps in independence or timeliness",
                "0.5": "Inconsistent reconciliation frequency or weak review controls",
                "0.25": "Informal reconciliation process without documented approval",
                "0.0": "No bank reconciliation controls documented"
            }
        }
    },

    {
        "criterion_id": "F6.4",

        "description": "Financial Reporting Accuracy and GAAP/IFRS Compliance.",

        "check_methods": [
            "Verify alignment of accounting policies with GAAP or IFRS as applicable",
            "Check existence of accounting policy manual or standards documentation",
            "Assess controls over financial statement preparation and review",
            "Evaluate disclosure completeness and accuracy controls",
            "Check controls over accounting estimates and judgments"
        ],

        "pass_criteria": [
            "Documented accounting policies aligned with applicable GAAP/IFRS standards",
            "Financial statements subject to management review before issuance",
            "Accounting estimates documented with support and approved by management",
            "Disclosure checklist used to ensure completeness",
            "Changes in accounting policies documented and disclosed appropriately"
        ],

        "evidence_requirements": {
            "accounting_policies": "Accounting policy manual or documentation",
            "gaap_ifrs_mapping": "GAAP/IFRS compliance mapping",
            "review_procedures": "Financial statement review procedures",
            "disclosure_checklist": "Disclosure completeness checklist",
            "estimate_documentation": "Accounting estimate support documentation"
        },

        "scoring_methodology": {
            "weight": 0.15,
            "thresholds": {
                "1.0": "Comprehensive accounting policies fully aligned with GAAP/IFRS with strong review controls",
                "0.75": "Well-documented policies with minor gaps or inconsistencies",
                "0.5": "Basic compliance framework but incomplete documentation",
                "0.25": "Implicit GAAP/IFRS adherence without formal documentation",
                "0.0": "No documented accounting standards or compliance framework"
            }
        }
    },

    {
        "criterion_id": "F6.5",

        "description": "Fraud Detection and Prevention Controls.",

        "check_methods": [
            "Verify existence of a documented fraud risk assessment",
            "Check anti-fraud policies and whistleblower mechanisms",
            "Assess automated transaction monitoring and anomaly detection",
            "Evaluate Benford's Law analysis or statistical monitoring of transactions",
            "Check investigation procedures for suspected fraud incidents"
        ],

        "pass_criteria": [
            "Documented fraud risk assessment conducted at least annually",
            "Anti-fraud policy communicated to all relevant personnel",
            "Whistleblower hotline or reporting mechanism available",
            "Automated monitoring of transactions for anomalous patterns",
            "Defined investigation and escalation procedures for fraud suspicions"
        ],

        "evidence_requirements": {
            "fraud_risk_assessment": "Fraud risk assessment documentation",
            "anti_fraud_policy": "Anti-fraud policy document",
            "whistleblower_docs": "Whistleblower mechanism documentation",
            "monitoring_procedures": "Transaction monitoring procedures",
            "investigation_procedures": "Fraud investigation procedures"
        },

        "scoring_methodology": {
            "weight": 0.17,
            "thresholds": {
                "1.0": "Comprehensive fraud risk management with automated monitoring and active controls",
                "0.75": "Strong anti-fraud framework with minor gaps in monitoring or procedures",
                "0.5": "Basic fraud controls but limited automation or incomplete risk assessment",
                "0.25": "Minimal fraud awareness without formal controls",
                "0.0": "No fraud detection or prevention controls documented"
            }
        }
    },

    {
        "criterion_id": "F6.6",

        "description": "Financial Audit Trail Completeness and Data Integrity.",

        "check_methods": [
            "Verify completeness of transaction audit trails across all financial modules",
            "Check immutability controls — whether posted entries can be altered without trace",
            "Assess data backup and recovery procedures for financial data",
            "Evaluate controls over master data (chart of accounts, vendor master, customer master)",
            "Check data retention policies for financial records per regulatory requirements"
        ],

        "pass_criteria": [
            "All financial transactions logged with timestamp, user, and before/after values",
            "Posted entries cannot be deleted — only reversed with audit trail",
            "Financial data backed up daily with tested recovery procedures",
            "Master data changes require dual authorization and are logged",
            "Financial records retained per applicable regulatory requirements (7 years minimum)"
        ],

        "evidence_requirements": {
            "audit_trail_docs": "Financial audit trail documentation or system configuration",
            "immutability_controls": "Controls preventing unauthorized modification of posted entries",
            "backup_procedures": "Data backup and recovery procedures",
            "master_data_controls": "Master data change management procedures",
            "retention_policy": "Financial data retention policy"
        },

        "scoring_methodology": {
            "weight": 0.15,
            "thresholds": {
                "1.0": "Complete immutable audit trail with strong data integrity and retention controls",
                "0.75": "Strong audit trail with minor gaps in immutability or retention",
                "0.5": "Partial audit trail coverage or weak data integrity controls",
                "0.25": "Basic transaction logging without immutability or formal retention policy",
                "0.0": "No financial audit trail or data integrity controls documented"
            }
        }
    }

]