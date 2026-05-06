SECURITY_CRITERIA = [

    {
        "criterion_id": "S3.1",

        "description": "Data Protection & Encryption ensuring secure storage and transmission of sensitive data.",

        "check_methods": [
            "Verify encryption standards for data at rest (e.g., AES-256)",
            "Verify encryption protocols for data in transit (e.g., TLS 1.3)",
            "Check key management practices and rotation policies",
            "Assess encryption coverage across systems handling sensitive data"
        ],

        "pass_criteria": [
            "AES-256 encryption implemented for data at rest",
            "TLS 1.3 (or higher) used for data in transit",
            "Key management and rotation policies documented",
            "Encryption applied to all sensitive data systems"
        ],

        "evidence_requirements": {
            "encryption_policy": "Documentation of encryption standards and policies",
            "key_management": "Key management and rotation procedures",
            "system_architecture": "Architecture showing encryption implementation",
            "security_configs": "Configuration files or security settings"
        },

        "scoring_methodology": {
            "weight": 0.15,
            "thresholds": {
                "1.0": "Full encryption coverage with strong key management",
                "0.75": "Encryption implemented with minor gaps",
                "0.5": "Partial encryption or inconsistent application",
                "0.0": "No encryption or major vulnerabilities"
            }
        }
    },

    {
        "criterion_id": "S3.2",

        "description": "Adversarial Robustness against attacks such as model evasion, poisoning, and prompt injection.",

        "check_methods": [
            "Verify existence of adversarial testing or penetration testing",
            "Assess frequency of security testing (within last 12 months)",
            "Check robustness against prompt injection and adversarial inputs",
            "Evaluate monitoring and mitigation mechanisms for attacks"
        ],

        "pass_criteria": [
            "Penetration or adversarial testing conducted within 12 months",
            "Known adversarial risks identified and mitigated",
            "Monitoring systems detect anomalous or malicious inputs",
            "Defense mechanisms against prompt injection exist"
        ],

        "evidence_requirements": {
            "penetration_tests": "Penetration testing reports or logs",
            "attack_simulations": "Adversarial testing documentation",
            "monitoring_systems": "Logs or systems detecting abnormal inputs",
            "mitigation_strategies": "Documentation of defense mechanisms"
        },

        "scoring_methodology": {
            "weight": 0.15,
            "thresholds": {
                "1.0": "Comprehensive adversarial testing and mitigation",
                "0.75": "Testing performed with minor gaps",
                "0.5": "Limited or outdated testing",
                "0.0": "No adversarial robustness measures"
            }
        }
    },

    {
        "criterion_id": "S3.3",

        "description": "Access Control & Authorization ensuring least privilege and secure identity management.",

        "check_methods": [
            "Verify implementation of role-based access control (RBAC)",
            "Check enforcement of least privilege principle",
            "Assess frequency of access reviews (e.g., quarterly)",
            "Evaluate authentication mechanisms (e.g., MFA)"
        ],

        "pass_criteria": [
            "RBAC implemented across systems",
            "Least privilege principle enforced",
            "Access reviews conducted at least quarterly",
            "Multi-factor authentication enabled"
        ],

        "evidence_requirements": {
            "access_policies": "Access control policy documentation",
            "rbac_configs": "Role-based access control configurations",
            "access_logs": "User access logs and audit trails",
            "review_records": "Access review reports"
        },

        "scoring_methodology": {
            "weight": 0.15,
            "thresholds": {
                "1.0": "Strong RBAC, MFA, and regular reviews",
                "0.75": "Access control implemented with minor gaps",
                "0.5": "Partial access controls or weak enforcement",
                "0.0": "No effective access control mechanisms"
            }
        }
    },

    {
        "criterion_id": "S3.4",

        "description": "Privacy by Design & Default ensuring compliance with GDPR Article 25.",

        "check_methods": [
            "Verify existence and completeness of DPIA",
            "Check ROPA documentation for all AI processing activities",
            "Assess whether privacy is enforced by default settings",
            "Evaluate data minimization practices"
        ],

        "pass_criteria": [
            "DPIA completed with all required sections and updated within 12 months",
            "ROPA covers all processing activities and is up to date",
            "Default settings prioritize privacy (opt-in)",
            "Data minimization practices documented"
        ],

        "evidence_requirements": {
            "dpia_document": "DPIA report including risk and mitigation analysis",
            "ropa_records": "Record of processing activities",
            "privacy_settings": "System configurations showing privacy defaults",
            "data_minimization": "Documentation of minimized data collection"
        },

        "scoring_methodology": {
            "weight": 0.20,
            "thresholds": {
                "1.0": "Full GDPR-compliant privacy by design implementation",
                "0.75": "Mostly compliant with minor documentation gaps",
                "0.5": "Partial implementation of privacy controls",
                "0.0": "No structured privacy by design approach"
            }
        }
    },

    {
        "criterion_id": "S3.5",

        "description": "Breach Detection & Notification ensuring timely incident response under GDPR and CCPA.",

        "check_methods": [
            "Verify existence of breach detection mechanisms",
            "Assess ability to notify authorities within 72 hours (GDPR)",
            "Check procedures for notifying affected individuals",
            "Evaluate incident response roles and responsibilities (RACI)"
        ],

        "pass_criteria": [
            "Automated breach detection mechanisms in place",
            "72-hour GDPR notification capability documented",
            "CCPA notification procedures implemented",
            "Incident response roles and responsibilities clearly defined"
        ],

        "evidence_requirements": {
            "detection_systems": "Breach detection system documentation",
            "notification_procedures": "GDPR and CCPA notification procedures",
            "incident_logs": "Incident response and breach logs",
            "raci_matrix": "Incident response RACI documentation"
        },

        "scoring_methodology": {
            "weight": 0.20,
            "thresholds": {
                "1.0": "Fully operational breach detection and notification system",
                "0.75": "System in place with minor gaps",
                "0.5": "Partial detection or delayed response capability",
                "0.0": "No breach detection or notification process"
            }
        }
    },

    {
        "criterion_id": "S3.6",

        "description": "Data Minimization & Retention ensuring compliance with GDPR and CCPA requirements.",

        "check_methods": [
            "Verify existence of data retention policies",
            "Check automated deletion mechanisms",
            "Assess processes for GDPR right to erasure",
            "Evaluate CCPA data deletion and correction rights"
        ],

        "pass_criteria": [
            "Data retention policies with defined retention periods",
            "Automated deletion processes implemented",
            "GDPR erasure requests handled within required timeframe",
            "CCPA deletion and correction rights supported"
        ],

        "evidence_requirements": {
            "retention_policy": "Data retention policy documentation",
            "deletion_logs": "Logs of data deletion processes",
            "erasure_requests": "GDPR erasure request handling records",
            "ccpa_requests": "CCPA data rights request logs"
        },

        "scoring_methodology": {
            "weight": 0.15,
            "thresholds": {
                "1.0": "Comprehensive retention and deletion framework",
                "0.75": "Policies implemented with minor gaps",
                "0.5": "Partial compliance with retention requirements",
                "0.0": "No retention or deletion controls"
            }
        }
    }

]
