MODULE_ID = "M1_GOVERNANCE"
VERSION = "3.1"

PASS_THRESHOLD = 0.75


SEVERITY_MAPPING = {

"pass": "PASS",

"minor_gap": "SIGNIFICANT_DEFICIENCY",

"major_gap": "MATERIAL_WEAKNESS"

}



GOVERNANCE_CRITERIA = [

{
"id": "G1.1",

"description": "AI Governance Policy",

"check_method":

"Verify existence of a board-approved AI governance policy including scope, roles, risk oversight, ethics, compliance, and privacy governance.",

"pass_criteria":

"Policy document exists, includes required sections, and board approval within 12 months.",

"evidence_requirements": {

"document_type": "Policy document",

"required_sections": [

"scope",
"roles",
"RACI",
"risk",
"ethics",
"compliance",
"privacy"

],

"approval_requirement":

"Board signature within last 12 months"

},

"scoring_method": {

"1.0": "All sections present and ≤6 months old",

"0.75": "All sections present with minor gaps and ≤12 months old",

"0.5": "Most sections present with significant gaps",

"0.0": "Policy missing or incomplete"

},

"weight": 0.20,

"regulations": ["SOX 404","ISO 42001"]

},



{
"id": "G1.2",

"description": "Risk Management System",

"check_method":

"Review AI risk register and monitoring process.",

"pass_criteria":

"At least five documented AI risks with quarterly monitoring.",

"evidence_requirements": {

"required_documents":

["AI risk register","risk monitoring reports"],

"minimum_risk_count": 5

},

"scoring_method": {

"1.0": "Risk register complete with quarterly monitoring",

"0.75": "Risk register exists with minor monitoring gaps",

"0.5": "Partial risk documentation",

"0.0": "No AI risk documentation"

},

"weight": 0.18,

"regulations": ["ISO 42001"]

},



{
"id": "G1.3",

"description": "SOX 404 Control Documentation",

"check_method":

"Verify internal control documentation mapped to COSO framework.",

"pass_criteria":

"At least 10 AI-related controls mapped to COSO with quarterly testing.",

"evidence_requirements": {

"required_documents":

["control matrix","COSO mapping","testing reports"]

},

"scoring_method": {

"1.0": "Controls documented and tested quarterly",

"0.75": "Controls documented with minor testing gaps",

"0.5": "Partial control documentation",

"0.0": "Controls missing"

},

"weight": 0.18,

"regulations": ["SOX 404"]

},



{
"id": "G1.4",

"description": "AI System Inventory",

"check_method":

"Review AI system registry or inventory list.",

"pass_criteria":

"All AI systems documented with quarterly updates.",

"evidence_requirements": {

"required_fields":

["system_name","owner","purpose","risk_level","last_update"]

},

"scoring_method": {

"1.0": "Complete inventory updated within 6 months",

"0.75": "Inventory complete with minor gaps",

"0.5": "Partial system inventory",

"0.0": "Inventory missing"

},

"weight": 0.12,

"regulations": ["ISO 42001"]

},



{
"id": "G1.5",

"description": "Training & Competency",

"check_method":

"Verify training records and competency assessments.",

"pass_criteria":

"At least 80% of relevant personnel trained with ≥85% assessment pass rate.",

"evidence_requirements": {

"required_documents":

["training logs","assessment reports"]

},

"scoring_method": {

"1.0": "Training coverage ≥80% and high assessment scores",

"0.75": "Training coverage adequate with minor gaps",

"0.5": "Limited training coverage",

"0.0": "No AI governance training"

},

"weight": 0.12,

"regulations": ["ISO 42001"]

},



{
"id": "G1.6",

"description": "ROPA Maintenance (GDPR)",

"check_method":

"Review Record of Processing Activities for AI systems.",

"pass_criteria":

"All processing activities documented according to GDPR Article 30.",

"evidence_requirements": {

"required_fields":

[
"activity",
"purposes",
"data_subjects",
"data_categories",
"recipients",
"transfers",
"retention",
"security_measures"
]

},

"scoring_method": {

"1.0": "All activities documented and ≤6 months old",

"0.75": "All activities documented with minor gaps ≤12 months",

"0.5": "Most activities documented",

"0.0": "ROPA incomplete or missing"

},

"weight": 0.10,

"regulations": ["GDPR"]

},



{
"id": "G1.7",

"description": "DPIA Governance (GDPR)",

"check_method":

"Review governance oversight of DPIA processes.",

"pass_criteria":

"DPO consulted for high-risk AI DPIAs and governance committee review.",

"evidence_requirements": {

"required_documents":

[
"DPIA procedure",
"DPO consultation logs",
"governance committee review",
"remediation tracking"
]

},

"scoring_method": {

"1.0": "Full DPIA governance process implemented",

"0.75": "DPIA governance mostly implemented",

"0.5": "Partial DPIA governance",

"0.0": "DPIA governance missing"

},

"weight": 0.10,

"regulations": ["GDPR"]

}

]
