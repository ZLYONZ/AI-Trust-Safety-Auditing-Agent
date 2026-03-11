// Import all 5 module schemas
import governanceSchema from '../data/schemas/module1_governance_schema.json';
import fairnessSchema from '../data/schemas/module2_fairness_schema.json';
import securitySchema from '../data/schemas/module3_security_schema.json';
import explainabilitySchema from '../data/schemas/module4_explainability_schema.json';
import accuracySchema from '../data/schemas/module5_accuracy_schema.json';

export const schemas = {
    M1_GOVERNANCE: governanceSchema,
    M2_FAIRNESS: fairnessSchema,
    M3_SECURITY: securitySchema,
    M4_EXPLAINABILITY: explainabilitySchema,
    M5_ACCURACY: accuracySchema,
};

export type ModuleId = keyof typeof schemas;

export const getSchemaById = (moduleId: ModuleId) => {
    return schemas[moduleId];
};

export const getAllModules = () => {
    return Object.values(schemas);
};

export const getCriterionById = (moduleId: ModuleId, criterionId: string) => {
    const schema = getSchemaById(moduleId);
    return schema?.evaluation_criteria.find(
        (c: any) => c.criterion_id === criterionId
    );
};

// Helper to get module display name
export const getModuleDisplayName = (moduleId: ModuleId): string => {
    const names: Record<ModuleId, string> = {
        M1_GOVERNANCE: 'Governance & Compliance',
        M2_FAIRNESS: 'Fairness & Bias',
        M3_SECURITY: 'Security & Privacy',
        M4_EXPLAINABILITY: 'Explainability & Audit Trail',
        M5_ACCURACY: 'Accuracy & Performance',
    };
    return names[moduleId];
};

// Helper to get module short name for UI
export const getModuleShortName = (moduleId: ModuleId): string => {
    const names: Record<ModuleId, string> = {
        M1_GOVERNANCE: 'governance',
        M2_FAIRNESS: 'fairness',
        M3_SECURITY: 'security',
        M4_EXPLAINABILITY: 'explainability',
        M5_ACCURACY: 'performance',
    };
    return names[moduleId];
};