// Based on the actual schema structure
export interface AuditSchema {
    $schema: string;
    title: string;
    description: string;
    version: string;
    module_id: string;
    regulatory_alignment: {
        sox_404?: string[];
        nist_ai_rmf?: string[];
        iso_42001?: string[];
        eu_ai_act?: string[];
        pcaob?: string[];
        gaap?: string[];
        // ... other standards
    };
    evaluation_criteria: EvaluationCriterion[];
    aggregate_scoring: AggregateScoring;
    interdependency_triggers?: InterdependencyTrigger[];
}

export interface EvaluationCriterion {
    criterion_id: string;
    criterion_name: string;
    description: string;
    iqbal_reference: string;
    check_method: string;
    pass_criteria: string;
    evidence_required: Evidence[];
    scoring: Scoring;
    severity_mapping: SeverityMapping;
}

export interface Evidence {
    evidence_id: string;
    evidence_type: string;
    evidence_name: string;
    format: string[];
    required_fields?: string[];
    // ... more fields
}

export interface Scoring {
    scale_type: string;
    pass_score?: number;
    pass_threshold?: number;
    calculation?: any;
    components?: any[];
    // ... varies by scale_type
}

export interface SeverityMapping {
    score_range?: [number, number];
    sox_classification: string;
    justification: string;
    regulatory_mapping?: {
        sox_404?: string;
        nist_govern?: string;
        iso_42001?: string;
        eu_ai_act?: string;
    };
}

export interface AggregateScoring {
    method: string;
    weights: Record<string, number>;
    overall_pass_threshold?: number;
    critical_criteria?: string[];
    critical_minimum?: number;
}

export interface InterdependencyTrigger {
    trigger_id: string;
    trigger_condition: string;
    triggered_module: string;
    action: string;
    rationale: string;
}