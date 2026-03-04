export interface Audit {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'failed';
  created_at: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  type: 'user' | 'system' | 'agent';
  content: string;
  timestamp: string;
}

export interface AuditReport {
  summary: string;
  overall_score: number;
  risk_level: 'low' | 'medium' | 'high';
  key_findings: string[];
  modules: ModuleResult[];
  risks: Risk[];
}

export interface ModuleResult {
  name: string;
  score: number;
  risk_level: 'low' | 'medium' | 'high';
  summary: string;
  findings: string[];
}

export interface Risk {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}
