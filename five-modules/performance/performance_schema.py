from pydantic import BaseModel
from typing import List


class Evidence(BaseModel):
    evidence_id: str
    evidence_type: str
    excerpt: str
    source_section: str


class PerformanceFinding(BaseModel):
    criterion_id: str
    description: str
    score: float
    evidence: Evidence
    severity: str
    weight: float


class PerformanceResult(BaseModel):
    module_id: str
    module_score: float
    pass_threshold: float
    risk_level: str
    findings: List[PerformanceFinding]
