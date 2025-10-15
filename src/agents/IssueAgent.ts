/**
 * IssueAgent - Issue analysis and label management
 */

import { Octokit } from '@octokit/rest';
import type { IssueData, AgentResult, AgentConfig } from '../types/agent.js';

export class IssueAgent {
  private octokit: Octokit;
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.octokit = new Octokit({ auth: config.githubToken });
  }

  async execute(issueNumber: number): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      console.log(`[IssueAgent] 📊 Analyzing Issue #${issueNumber}`);

      const issue = await this.fetchIssue(issueNumber);
      const complexity = this.estimateComplexity(issue);
      const suggestedLabels = this.suggestLabels(issue);

      console.log(`[IssueAgent]    Complexity: ${complexity}`);
      console.log(`[IssueAgent]    Suggested labels: ${suggestedLabels.join(', ')}`);

      return {
        success: true,
        data: { issue, complexity, suggestedLabels },
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      };
    }
  }

  async fetchIssue(issueNumber: number): Promise<IssueData> {
    const [owner, repo] = this.config.repository.split('/');

    const { data } = await this.octokit.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });

    return {
      number: data.number,
      title: data.title,
      body: data.body || '',
      labels: data.labels.map((label) =>
        typeof label === 'string' ? label : label.name || ''
      ),
      assignees: data.assignees?.map((a) => a.login) || [],
      state: data.state,
    };
  }

  private estimateComplexity(issue: IssueData): 'small' | 'medium' | 'large' | 'xlarge' {
    const requirementCount = (issue.body.match(/- \[ \]/g) || []).length;
    const bodyLength = issue.body.length;

    if (requirementCount >= 7 || bodyLength > 2000) {
      return 'xlarge';
    } else if (requirementCount >= 5 || bodyLength > 1000) {
      return 'large';
    } else if (requirementCount >= 3 || bodyLength > 500) {
      return 'medium';
    } else {
      return 'small';
    }
  }

  private suggestLabels(issue: IssueData): string[] {
    const labels: string[] = [];
    const body = issue.body.toLowerCase();
    const title = issue.title.toLowerCase();

    // Type labels
    if (body.includes('bug') || title.includes('bug') || title.includes('fix')) {
      labels.push('bug');
    } else if (body.includes('feature') || title.includes('feature') || body.includes('新機能')) {
      labels.push('feature');
    } else if (body.includes('refactor') || title.includes('refactor')) {
      labels.push('refactor');
    } else if (body.includes('docs') || title.includes('docs') || body.includes('ドキュメント')) {
      labels.push('documentation');
    } else if (body.includes('security') || title.includes('security') || body.includes('セキュリティ')) {
      labels.push('security');
    } else if (body.includes('test') || title.includes('test') || body.includes('テスト')) {
      labels.push('test');
    }

    // Priority labels
    if (issue.labels.includes('priority-high') || body.includes('urgent') || body.includes('緊急')) {
      labels.push('priority-high');
    }

    // Agent execution
    if (issue.labels.includes('agent-execute')) {
      labels.push('agent-execute');
    }

    return labels;
  }
}
