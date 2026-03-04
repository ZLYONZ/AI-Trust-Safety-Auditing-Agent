import { X, Download, Shield, Scale, Eye, Gauge, AlertTriangle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useState } from 'react';
import { schemas } from '../../utils/schemaLoader';

const RightPanel = () => {
  const { currentAuditId, closeRightPanel } = useUIStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'risks'>('overview');

  if (!currentAuditId) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-white">
        <button
          onClick={closeRightPanel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center text-gray-500">
          <p className="text-sm">No audit selected</p>
          <p className="text-xs mt-1">Select an audit to view the report</p>
        </div>
      </div>
    );
  }

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

  // Mock audit results for each criterion
  const mockCriterionResults: Record<string, { score: number; sox_classification: string }> = {
    'G1.1': { score: 0.75, sox_classification: 'Significant Deficiency' },
    'G1.2': { score: 0.85, sox_classification: 'Control Deficiency' },
    'G1.3': { score: 0.90, sox_classification: 'Pass' },
    'G1.4': { score: 0.80, sox_classification: 'Pass' },
    'G1.5': { score: 0.95, sox_classification: 'Pass' },
  };

  // Mock data
  const mockReport = {
    summary: 'The FinanceBot AI system demonstrates strong governance practices with some areas requiring attention in fairness and bias mitigation.',
    overall_score: 78,
    risk_level: 'medium' as const,
    key_findings: [
      'Model governance documentation is comprehensive and up-to-date',
      'Potential bias detected in loan approval predictions for specific demographics',
      'Security controls meet industry standards',
    ],
    modules: [
      {
        name: 'governance',
        score: 85,
        risk_level: 'low' as const,
        summary: 'Strong governance framework with clear documentation',
        findings: ['Well-documented model cards', 'Clear version control'],
      },
      {
        name: 'fairness',
        score: 68,
        risk_level: 'medium' as const,
        summary: 'Some fairness concerns identified in protected attributes',
        findings: ['Disparate impact detected', 'Requires bias mitigation'],
      },
      {
        name: 'security',
        score: 82,
        risk_level: 'low' as const,
        summary: 'Security measures are robust and well-implemented',
        findings: ['Encryption in place', 'Access controls validated'],
      },
    ],
  };

  const moduleIcons: Record<string, JSX.Element> = {
    governance: <Shield className="w-4 h-4" />,
    fairness: <Scale className="w-4 h-4" />,
    security: <Shield className="w-4 h-4" />,
    explainability: <Eye className="w-4 h-4" />,
    performance: <Gauge className="w-4 h-4" />,
  };

  return (
    <div className="h-full flex flex-col bg-white">
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
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium">
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium">
            <Download className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>

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

      <div className="flex-1 overflow-y-auto p-4">
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
          </div>
        )}

        {activeTab === 'modules' && (
          <div className="space-y-3">
            {schemas.M1_GOVERNANCE.evaluation_criteria.map((criterion) => {
              const result = mockCriterionResults[criterion.criterion_id] || {
                score: 0.85,
                sox_classification: 'Pass'
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
                    <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${getSeverityColor(result.sox_classification)}`}>
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

                  {/* Evidence reviewed */}
                  <div className="mt-3 text-xs">
                    <span className="font-medium">Evidence Reviewed:</span>
                    <ul className="mt-1 space-y-1">
                      {criterion.evidence_required.map((ev) => (
                        <li key={ev.evidence_id} className="text-gray-600">
                          • {ev.evidence_name} ({ev.evidence_type})
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Regulatory impact */}
                  {criterion.severity_mapping.regulatory_mapping && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
                      <span className="font-medium">Regulatory Impact:</span>
                      <ul className="mt-1 space-y-1">
                        {Object.entries(criterion.severity_mapping.regulatory_mapping).map(
                          ([standard, impact]) => (
                            <li key={standard} className="text-gray-700">
                              <span className="font-medium">{standard}:</span> {impact}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Potential Bias in Loan Approvals</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRiskColor('medium')}`}>
                      MEDIUM
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Analysis detected disparate impact on protected demographic groups in loan approval predictions.
                  </p>
                  <div className="bg-teal-50 border border-teal-200 rounded p-2">
                    <p className="text-xs font-medium text-teal-900 mb-1">Recommendation:</p>
                    <p className="text-xs text-teal-800">
                      Implement bias mitigation techniques such as reweighting or adversarial debiasing. Consider collecting more diverse training data.
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