/**
 * Agent Types for Miyabi Framework
 */

export interface AgentConfig {
  githubToken: string;
  anthropicApiKey: string;
  repository: string;
  deviceIdentifier: string;
  logDirectory: string;
  reportDirectory: string;
}

export interface Task {
  id: string;
  description: string;
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  agent?: string;
}

export interface DAG {
  nodes: Task[];
  edges: Array<{ from: string; to: string }>;
  levels: number;
}

export interface AgentResult {
  success: boolean;
  data?: unknown;
  error?: string;
  duration: number;
}

export interface IssueData {
  number: number;
  title: string;
  body: string;
  labels: string[];
  assignees: string[];
  state: string;
}

export interface QualityScore {
  total: number;
  typescript: number;
  eslint: number;
  security: number;
  coverage: number;
  passed: boolean;
}

export interface GeneratedCode {
  files: Array<{
    path: string;
    content: string;
  }>;
  summary: string;
}

export interface PRData {
  number: number;
  url: string;
  title: string;
  body: string;
}
