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

export const getSchemaById = (moduleId: string) => {
    return schemas[moduleId as keyof typeof schemas];
};

export const getAllModules = () => {
    return Object.values(schemas);
};

export const getCriterionById = (moduleId: string, criterionId: string) => {
    const schema = getSchemaById(moduleId);
    return schema?.evaluation_criteria.find(
        c => c.criterion_id === criterionId
    );
};