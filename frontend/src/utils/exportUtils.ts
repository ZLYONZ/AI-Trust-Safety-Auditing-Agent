// Utility functions for exporting audit reports

interface AuditReportData {
  auditId: string;
  auditName: string;
  timestamp: string;
  overallScore: number;
  riskLevel: string;
  summary: string;
  keyFindings: string[];
  modules: ModuleResult[];
  criteria: CriterionResult[];
}

interface ModuleResult {
  moduleId: string;
  moduleName: string;
  score: number;
  criteriaCount: number;
}

interface CriterionResult {
  criterionId: string;
  criterionName: string;
  description: string;
  score: number;
  soxClassification: string;
  evidenceRequired: string[];
  regulatoryImpact: Record<string, string>;
}

/**
 * Export audit report as JSON file
 */
export const exportAsJSON = (reportData: AuditReportData) => {
  const jsonString = JSON.stringify(reportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `TrustGuard_Audit_Report_${reportData.auditId}_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export audit report as PDF (using browser print)
 */
export const exportAsPDF = (reportData: AuditReportData) => {
  // Create a new window with formatted HTML
  const printWindow = window.open('', '', 'width=800,height=600');

  if (!printWindow) {
    alert('Please allow popups to download PDF');
    return;
  }

  const htmlContent = generatePDFHTML(reportData);

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    // Close after printing (user can cancel)
    setTimeout(() => printWindow.close(), 100);
  };
};

/**
 * Generate formatted HTML for PDF export
 */
const generatePDFHTML = (reportData: AuditReportData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>TrustGuard - Audit Report</title>
      <style>
        @media print {
          @page {
            margin: 1in;
            size: letter;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .page-break {
            page-break-after: always;
          }
          .no-print {
            display: none;
          }
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        h1 {
          color: #1E2761;
          font-size: 28px;
          margin-bottom: 10px;
          border-bottom: 3px solid #028090;
          padding-bottom: 10px;
        }
        
        h2 {
          color: #028090;
          font-size: 20px;
          margin-top: 30px;
          margin-bottom: 15px;
          border-bottom: 2px solid #E5E7EB;
          padding-bottom: 5px;
        }
        
        h3 {
          color: #1E2761;
          font-size: 16px;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #028090;
          margin-bottom: 5px;
        }
        
        .subtitle {
          color: #6B7280;
          font-size: 14px;
        }
        
        .metadata {
          background: #F9FAFB;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 30px;
          border: 1px solid #E5E7EB;
        }
        
        .metadata-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .metadata-label {
          font-weight: 600;
          color: #4B5563;
        }
        
        .metadata-value {
          color: #1F2937;
        }
        
        .score-box {
          background: linear-gradient(135deg, #028090 0%, #00A896 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
        }
        
        .score-number {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .score-label {
          font-size: 14px;
          opacity: 0.9;
        }
        
        .summary-box {
          background: #F0FDFA;
          border-left: 4px solid #028090;
          padding: 15px;
          margin: 20px 0;
        }
        
        .finding-item {
          padding: 10px;
          margin: 10px 0;
          border-left: 3px solid #FCD34D;
          background: #FFFBEB;
          padding-left: 15px;
        }
        
        .criterion {
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
          break-inside: avoid;
        }
        
        .criterion-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 10px;
        }
        
        .criterion-title {
          font-weight: 600;
          color: #1F2937;
          font-size: 14px;
        }
        
        .criterion-description {
          color: #6B7280;
          font-size: 13px;
          margin: 5px 0 10px 0;
        }
        
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }
        
        .badge-red {
          background: #FEE2E2;
          color: #991B1B;
          border: 1px solid #FECACA;
        }
        
        .badge-orange {
          background: #FFEDD5;
          color: #9A3412;
          border: 1px solid #FED7AA;
        }
        
        .badge-yellow {
          background: #FEF3C7;
          color: #92400E;
          border: 1px solid #FDE68A;
        }
        
        .badge-green {
          background: #D1FAE5;
          color: #065F46;
          border: 1px solid #A7F3D0;
        }
        
        .score-bar {
          background: #E5E7EB;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin: 10px 0;
        }
        
        .score-fill {
          background: #028090;
          height: 100%;
        }
        
        .evidence-list {
          background: #F9FAFB;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }
        
        .evidence-list ul {
          margin: 5px 0;
          padding-left: 20px;
        }
        
        .evidence-list li {
          font-size: 12px;
          color: #4B5563;
          margin: 3px 0;
        }
        
        .regulatory-impact {
          background: #FFFBEB;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid #FDE68A;
          margin: 10px 0;
        }
        
        .regulatory-impact ul {
          margin: 5px 0;
          padding-left: 20px;
        }
        
        .regulatory-impact li {
          font-size: 12px;
          color: #78350F;
          margin: 3px 0;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #E5E7EB;
          text-align: center;
          color: #6B7280;
          font-size: 12px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #E5E7EB;
        }
        
        th {
          background: #F9FAFB;
          font-weight: 600;
          color: #1F2937;
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="logo">TrustGuard</div>
        <div class="subtitle">AI Trust & Safety Auditing Platform</div>
      </div>
      
      <h1>Audit Report</h1>
      
      <!-- Metadata -->
      <div class="metadata">
        <div class="metadata-row">
          <span class="metadata-label">Audit ID:</span>
          <span class="metadata-value">${reportData.auditId}</span>
        </div>
        <div class="metadata-row">
          <span class="metadata-label">Audit Name:</span>
          <span class="metadata-value">${reportData.auditName}</span>
        </div>
        <div class="metadata-row">
          <span class="metadata-label">Generated:</span>
          <span class="metadata-value">${reportData.timestamp}</span>
        </div>
        <div class="metadata-row">
          <span class="metadata-label">Risk Level:</span>
          <span class="metadata-value" style="text-transform: uppercase; font-weight: 600;">${reportData.riskLevel}</span>
        </div>
      </div>
      
      <!-- Overall Score -->
      <div class="score-box">
        <div class="score-number">${reportData.overallScore}</div>
        <div class="score-label">Overall Risk Score (out of 100)</div>
      </div>
      
      <!-- Executive Summary -->
      <h2>Executive Summary</h2>
      <div class="summary-box">
        ${reportData.summary}
      </div>
      
      <!-- Key Findings -->
      <h2>Key Findings</h2>
      ${reportData.keyFindings.map(finding => `
        <div class="finding-item">${finding}</div>
      `).join('')}
      
      <!-- Module Scores -->
      <h2>Module Scores</h2>
      <table>
        <thead>
          <tr>
            <th>Module</th>
            <th>Score</th>
            <th>Criteria Count</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.modules.map(module => `
            <tr>
              <td>${module.moduleName}</td>
              <td>${(module.score * 100).toFixed(0)}%</td>
              <td>${module.criteriaCount}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="page-break"></div>
      
      <!-- Detailed Criteria Results -->
      <h2>Detailed Findings by Criterion</h2>
      ${reportData.criteria.map(criterion => `
        <div class="criterion">
          <div class="criterion-header">
            <div>
              <div class="criterion-title">${criterion.criterionId}: ${criterion.criterionName}</div>
              <div class="criterion-description">${criterion.description}</div>
            </div>
            <span class="badge ${getSeverityClass(criterion.soxClassification)}">${criterion.soxClassification}</span>
          </div>
          
          <div class="score-bar">
            <div class="score-fill" style="width: ${criterion.score * 100}%"></div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #6B7280; margin-top: 5px;">
            Score: ${criterion.score.toFixed(2)}/1.0
          </div>
          
          ${criterion.evidenceRequired.length > 0 ? `
            <div class="evidence-list">
              <strong style="font-size: 13px;">Evidence Required:</strong>
              <ul>
                ${criterion.evidenceRequired.map(ev => `<li>${ev}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${Object.keys(criterion.regulatoryImpact).length > 0 ? `
            <div class="regulatory-impact">
              <strong style="font-size: 13px;">Regulatory Impact:</strong>
              <ul>
                ${Object.entries(criterion.regulatoryImpact).map(([standard, impact]) => `
                  <li><strong>${standard.toUpperCase()}:</strong> ${impact}</li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `).join('')}
      
      <!-- Footer -->
      <div class="footer">
        <p>This report was generated by TrustGuard AI Trust & Safety Auditing Platform</p>
        <p>NYU SPS Spring 2026 Applied Project Capstone | Lyon Zhang</p>
        <p>Generated on ${reportData.timestamp}</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Helper function to get CSS class for severity badge
 */
const getSeverityClass = (classification: string): string => {
  switch (classification) {
    case 'Material Weakness':
      return 'badge-red';
    case 'Significant Deficiency':
      return 'badge-orange';
    case 'Control Deficiency':
      return 'badge-yellow';
    case 'Pass':
    case 'Pass - No deficiency':
      return 'badge-green';
    default:
      return 'badge-yellow';
  }
};