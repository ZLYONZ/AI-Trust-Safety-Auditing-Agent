import { X, Download, Shield, Scale, Eye, Gauge, AlertTriangle, Lock } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useState } from 'react';
import { exportAsJSON, exportAsPDF } from '../../utils/exportUtils';

// Import schemas directly
import governanceSchema from '../../data/schemas/module1_governance_schema.json';
import fairnessSchema from '../../data/schemas/module2_fairness_schema.json';
import securitySchema from '../../data/schemas/module3_security_schema.json';
import explainabilitySchema from '../../data/schemas/module4_explainability_schema.json';
import accuracySchema from '../../data/schemas/module5_accuracy_schema.json';

type ModuleId = 'M1_GOVERNANCE' | 'M2_FAIRNESS' | 'M3_SECURITY' | 'M4_EXPLAINABILITY' | 'M5_ACCURACY';

const RightPanel = () => {
  const { currentAuditId, closeRightPanel } = useUIStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'risks'>('overview');
  const [selectedModule, setSelectedModule] = useState<ModuleId>('M1_GOVERNANCE');

  if (!currentAuditId) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-white">
        <div className="text-center text-gray-500">
          <p className="text-sm">No audit selected</p>
          <p className="text-xs mt-1">Select an audit to view the report</p>
        </div>
      </div>
    );
  }

  // Schemas object
  const schemas: Record<ModuleId, any> = {
    M1_GOVERNANCE: governanceSchema,
    M2_FAIRNESS: fairnessSchema,
    M3_SECURITY: securitySchema,
    M4_EXPLAINABILITY: explainabilitySchema,
    M5_ACCURACY: accuracySchema,
  };

  // Module display names
  const moduleNames: Record<ModuleId, string> = {
    M1_GOVERNANCE: 'Governance & Compliance',
    M2_FAIRNESS: 'Fairness & Bias',
    M3_SECURITY: 'Security & Privacy',
    M4_EXPLAINABILITY: 'Explainability & Audit Trail',
    M5_ACCURACY: 'Accuracy & Performance',
  };

  // Module icons
  const moduleIcons: Record<ModuleId, JSX.Element> = {
    M1_GOVERNANCE: <Shield className="w-4 h-4" />,
    M2_FAIRNESS: <Scale className="w-4 h-4" />,
    M3_SECURITY: <Lock className="w-4 h-4" />,
    M4_EXPLAINABILITY: <Eye className="w-4 h-4" />,
    M5_ACCURACY: <Gauge className="w-4 h-4" />,
  };

  // Helper function for SOX classification colors
  const getSeverityColor = (classification: string) => {
    switch (classification) {
      case 'Material Weakness':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Significant Deficiency':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Control Deficiency':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Pass':
      case 'Pass - No deficiency':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Mock audit results
  const mockCriterionResults: Record<string, { score: number; sox_classification: string }> = {
    // Governance (5 criteria)
    'G1.1': { score: 0.75, sox_classification: 'Significant Deficiency' },
    'G1.2': { score: 0.85, sox_classification: 'Control Deficiency' },
    'G1.3': { score: 0.90, sox_classification: 'Pass' },
    'G1.4': { score: 0.80, sox_classification: 'Pass' },
    'G1.5': { score: 0.95, sox_classification: 'Pass' },
    // Fairness (3 criteria)
    'F2.1': { score: 0.68, sox_classification: 'Significant Deficiency' },
    'F2.2': { score: 0.82, sox_classification: 'Pass' },
    'F2.3': { score: 0.75, sox_classification: 'Control Deficiency' },
    // Security (3 criteria)
    'S3.1': { score: 0.96, sox_classification: 'Pass' },
    'S3.2': { score: 0.85, sox_classification: 'Pass' },
    'S3.3': { score: 0.91, sox_classification: 'Pass' },
    // Explainability (3 criteria)
    'E4.1': { score: 0.88, sox_classification: 'Pass' },
    'E4.2': { score: 0.92, sox_classification: 'Pass' },
    'E4.3': { score: 0.87, sox_classification: 'Pass' },
    // Accuracy (3 criteria)
    'A5.1': { score: 0.78, sox_classification: 'Control Deficiency' },
    'A5.2': { score: 0.86, sox_classification: 'Pass' },
    'A5.3': { score: 0.89, sox_classification: 'Pass' },
  };

  // Calculate module score
  const getModuleScore = (moduleId: ModuleId): number => {
    const schema = schemas[moduleId];

    // Check if aggregate_scoring exists
    if (!schema.aggregate_scoring || !schema.aggregate_scoring.weights) {
      return 0;
    }

    const weights = schema.aggregate_scoring.weights;
    let totalScore = 0;

    if (schema.evaluation_criteria && Array.isArray(schema.evaluation_criteria)) {
      schema.evaluation_criteria.forEach((criterion: any) => {
        const criterionId = criterion.criterion_id;
        const result = mockCriterionResults[criterionId];
        const weight = weights[criterionId];

        // Only add if both result and weight exist
        if (result && typeof weight === 'number') {
          totalScore += result.score * weight;
        }
      });
    }

    return totalScore;
  };

  const mockReport = {
    summary: 'The FinanceBot AI system demonstrates strong governance practices with some areas requiring attention in fairness and bias mitigation.',
    overall_score: 82,
    risk_level: 'medium' as const,
    key_findings: [
      'Governance policy exists but lacks full board approval (G1.1)',
      'Potential bias detected in loan approval predictions (F2.1)',
      'Security controls meet industry standards (S3.1)',
      'Explainability documentation is comprehensive (E4.1, E4.2)',
      'Model accuracy monitoring shows minor drift (A5.1)',
    ],
  };


  // Export handlers
  const handleExportPDF = () => {
    // Gather all criteria data
    const allCriteria: any[] = [];

    (Object.keys(schemas) as ModuleId[]).forEach(moduleId => {
      const schema = schemas[moduleId];
      schema.evaluation_criteria.forEach((criterion: any) => {
        const result = mockCriterionResults[criterion.criterion_id] || { score: 0.85, sox_classification: 'Pass' };

        allCriteria.push({
          criterionId: criterion.criterion_id,
          criterionName: criterion.criterion_name,
          description: criterion.description,
          score: result.score,
          soxClassification: result.sox_classification,
          evidenceRequired: criterion.evidence_required.map((ev: any) => `${ev.evidence_name} (${ev.evidence_type})`),
          regulatoryImpact: criterion.severity_mapping?.regulatory_mapping || {},
        });
      });
    });

    const reportData = {
      auditId: currentAuditId,
      auditName: 'FinanceBot AI System Audit',
      timestamp: new Date().toLocaleString(),
      overallScore: mockReport.overall_score,
      riskLevel: mockReport.risk_level,
      summary: mockReport.summary,
      keyFindings: mockReport.key_findings,
      modules: (Object.keys(schemas) as ModuleId[]).map(moduleId => ({
        moduleId,
        moduleName: moduleNames[moduleId],
        score: getModuleScore(moduleId),
        criteriaCount: schemas[moduleId].evaluation_criteria.length,
      })),
      criteria: allCriteria,
    };

    exportAsPDF(reportData);
  };

  const handleExportJSON = () => {
    // Gather all criteria data
    const allCriteria: any[] = [];

    (Object.keys(schemas) as ModuleId[]).forEach(moduleId => {
      const schema = schemas[moduleId];
      schema.evaluation_criteria.forEach((criterion: any) => {
        const result = mockCriterionResults[criterion.criterion_id] || { score: 0.85, sox_classification: 'Pass' };

        allCriteria.push({
          criterionId: criterion.criterion_id,
          criterionName: criterion.criterion_name,
          description: criterion.description,
          score: result.score,
          soxClassification: result.sox_classification,
          evidenceRequired: criterion.evidence_required.map((ev: any) => `${ev.evidence_name} (${ev.evidence_type})`),
          regulatoryImpact: criterion.severity_mapping?.regulatory_mapping || {},
        });
      });
    });

    const reportData = {
      auditId: currentAuditId,
      auditName: 'FinanceBot AI System Audit',
      timestamp: new Date().toISOString(),
      overallScore: mockReport.overall_score,
      riskLevel: mockReport.risk_level,
      summary: mockReport.summary,
      keyFindings: mockReport.key_findings,
      modules: (Object.keys(schemas) as ModuleId[]).map(moduleId => ({
        moduleId,
        moduleName: moduleNames[moduleId],
        score: getModuleScore(moduleId),
        criteriaCount: schemas[moduleId].evaluation_criteria.length,
      })),
      criteria: allCriteria,
    };

    exportAsJSON(reportData);
  };

  // Get current module data
  const currentModuleSchema = schemas[selectedModule];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Audit Report</h2>
          <button
            onClick={closeRightPanel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium">
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={handleExportJSON}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium">
            <Download className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {['overview', 'modules', 'risks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors capitalize ${activeTab === tab
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Executive Summary</h3>
              <p className="text-sm text-gray-700">{mockReport.summary}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Overall Risk Score</h3>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {mockReport.overall_score}
                    </span>
                    <span className="text-sm text-gray-500">/ 100</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 capitalize">
                    {mockReport.risk_level} Risk
                  </p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getRiskColor(mockReport.risk_level)}`}>
                  {mockReport.risk_level.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Key Findings</h3>
              <div className="space-y-2">
                {mockReport.key_findings.map((finding, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{finding}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Module Scores Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Module Scores</h3>
              <div className="space-y-3">
                {(Object.keys(schemas) as ModuleId[]).map((moduleId) => {
                  const score = getModuleScore(moduleId);
                  return (
                    <div key={moduleId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-teal-600">
                          {moduleIcons[moduleId]}
                        </div>
                        <span className="text-sm font-medium">
                          {moduleNames[moduleId]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-teal-600 h-2 rounded-full"
                            style={{ width: `${score * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {(score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-4">
            {/* Module Selector Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(schemas) as ModuleId[]).map((moduleId) => (
                <button
                  key={moduleId}
                  onClick={() => setSelectedModule(moduleId)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedModule === moduleId
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {moduleIcons[moduleId]}
                  <span className="text-left flex-1">{moduleNames[moduleId]}</span>
                </button>
              ))}
            </div>

            {/* Current Module Title */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
              <h3 className="font-semibold text-teal-900 text-sm">
                {currentModuleSchema?.title || 'Loading...'}
              </h3>
              <p className="text-xs text-teal-700 mt-1">
                {currentModuleSchema?.description || ''}
              </p>
            </div>

            {/* Criteria List */}
            <div className="space-y-3">
              {currentModuleSchema?.evaluation_criteria?.map((criterion: any) => {
                const result = mockCriterionResults[criterion.criterion_id] || {
                  score: 0.85,
                  sox_classification: 'Pass',
                };

                return (
                  <div key={criterion.criterion_id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-2">
                        <h4 className="font-semibold text-sm">
                          {criterion.criterion_id}: {criterion.criterion_name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {criterion.description}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs whitespace-nowrap ${getSeverityColor(
                          result.sox_classification
                        )}`}
                      >
                        {result.sox_classification}
                      </span>
                    </div>

                    {/* Score bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Score</span>
                        <span>{result.score.toFixed(2)}/1.0</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-teal-600 h-2 rounded-full"
                          style={{ width: `${result.score * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Evidence required */}
                    {criterion.evidence_required && criterion.evidence_required.length > 0 && (
                      <div className="mt-3 text-xs">
                        <span className="font-medium">Evidence Required:</span>
                        <ul className="mt-1 space-y-1">
                          {criterion.evidence_required.map((ev: any) => (
                            <li key={ev.evidence_id} className="text-gray-600">
                              • {ev.evidence_name} ({ev.evidence_type})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Regulatory impact */}
                    {criterion.severity_mapping?.regulatory_mapping && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
                        <span className="font-medium">Regulatory Impact:</span>
                        <ul className="mt-1 space-y-1">
                          {Object.entries(criterion.severity_mapping.regulatory_mapping).map(
                            ([standard, impact]) => (
                              <li key={standard} className="text-gray-700">
                                <span className="font-medium uppercase">{standard}:</span> {impact as string}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              }) || <p className="text-center text-gray-500 py-8">No criteria found</p>}
            </div>
          </div>
        )}

        {/* Risks Tab */}
        {activeTab === 'risks' && (
          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-red-600 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Missing Board Approval for AI Governance Policy</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${getSeverityColor('Significant Deficiency')}`}>
                      SIGNIFICANT DEFICIENCY
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    AI governance policy exists but lacks formal board approval (G1.1 score: 0.75). This creates control environment deficiency per SOX 404.
                  </p>
                  <div className="bg-teal-50 border border-teal-200 rounded p-2">
                    <p className="text-xs font-medium text-teal-900 mb-1">Recommendation:</p>
                    <p className="text-xs text-teal-800">
                      Obtain board approval for AI governance policy within 30 days. Ensure RACI matrix covers all AI systems and ethics committee meets quarterly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Potential Bias in Loan Approvals</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${getSeverityColor('Significant Deficiency')}`}>
                      SIGNIFICANT DEFICIENCY
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Disparate impact detected on protected demographic groups in loan approval predictions (F2.1 score: 0.68).
                  </p>
                  <div className="bg-teal-50 border border-teal-200 rounded p-2">
                    <p className="text-xs font-medium text-teal-900 mb-1">Recommendation:</p>
                    <p className="text-xs text-teal-800">
                      Implement bias mitigation techniques such as reweighting or adversarial debiasing. Conduct comprehensive fairness testing per NIST AI RMF MEASURE-2.10, 2.11.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Model Accuracy Below Threshold</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${getSeverityColor('Control Deficiency')}`}>
                      CONTROL DEFICIENCY
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Model validation shows accuracy score of 0.78, approaching materiality-based thresholds (A5.1).
                  </p>
                  <div className="bg-teal-50 border border-teal-200 rounded p-2">
                    <p className="text-xs font-medium text-teal-900 mb-1">Recommendation:</p>
                    <p className="text-xs text-teal-800">
                      Review validation methodology and retrain if accuracy degradation exceeds 5%. Ensure validation dataset is representative (min 20% holdout).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;