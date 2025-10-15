/**
 * PRAgent - Automatic Pull Request creation
 */

import { Octokit } from '@octokit/rest';
import type { IssueData, GeneratedCode, PRData, AgentResult, AgentConfig } from '../types/agent.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export class PRAgent {
  private octokit: Octokit;
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.octokit = new Octokit({ auth: config.githubToken });
  }

  async execute(issue: IssueData, generatedCode: GeneratedCode, autoMerge = false): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      console.log(`[PRAgent] 🚀 Creating Pull Request`);

      // Write generated files to disk
      this.writeGeneratedFiles(generatedCode);

      // Create git branch and commit
      const branchName = this.createBranch(issue);
      this.commitChanges(issue, generatedCode);

      // Push to remote
      this.pushBranch(branchName);

      // Create PR
      const pr = await this.createPullRequest(issue, generatedCode, branchName, autoMerge);

      console.log(`[PRAgent] ✅ PR created: #${pr.number}`);

      // Auto-merge if enabled
      if (autoMerge) {
        await this.mergePullRequest(pr.number);
        console.log(`[PRAgent] ✅ PR merged automatically: #${pr.number}`);
      }

      return {
        success: true,
        data: pr,
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

  private writeGeneratedFiles(generatedCode: GeneratedCode): void {
    for (const file of generatedCode.files) {
      const fullPath = path.resolve(process.cwd(), file.path);
      const dir = path.dirname(fullPath);

      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(fullPath, file.content, 'utf-8');
    }
  }

  private createBranch(issue: IssueData): string {
    const branchName = `feature/issue-${issue.number}`;

    try {
      execSync(`git checkout -b ${branchName}`, { stdio: 'pipe' });
    } catch (error) {
      // Branch might already exist, checkout to it
      execSync(`git checkout ${branchName}`, { stdio: 'pipe' });
    }

    return branchName;
  }

  private commitChanges(issue: IssueData, generatedCode: GeneratedCode): void {
    // Add all generated files
    for (const file of generatedCode.files) {
      execSync(`git add ${file.path}`, { stdio: 'pipe' });
    }

    const commitMessage = `feat: ${issue.title}

${generatedCode.summary}

Closes #${issue.number}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

    execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { stdio: 'pipe' });
  }

  private pushBranch(branchName: string): void {
    execSync(`git push -u origin ${branchName}`, { stdio: 'pipe' });
  }

  private async createPullRequest(
    issue: IssueData,
    generatedCode: GeneratedCode,
    branchName: string,
    autoMerge: boolean
  ): Promise<PRData> {
    const [owner, repo] = this.config.repository.split('/');

    const body = `## Summary

${generatedCode.summary}

## Changes

${generatedCode.files.map((f) => `- \`${f.path}\``).join('\n')}

## Related Issue

Closes #${issue.number}

## Test Plan

- [ ] Code compiles without TypeScript errors
- [ ] ESLint passes
- [ ] Tests pass (if applicable)
- [ ] Manual testing completed

${autoMerge ? '## Auto-Merge\n\n✅ This PR will be automatically merged after creation.\n\n' : ''}---

🤖 Generated with [Claude Code](https://claude.com/claude-code)`;

    const { data } = await this.octokit.pulls.create({
      owner,
      repo,
      title: `feat: ${issue.title}`,
      head: branchName,
      base: 'main',
      body,
      draft: !autoMerge, // If auto-merge, don't create as draft
    });

    return {
      number: data.number,
      url: data.html_url,
      title: data.title,
      body: data.body || '',
    };
  }

  private async mergePullRequest(prNumber: number): Promise<void> {
    const [owner, repo] = this.config.repository.split('/');

    // Merge the PR
    await this.octokit.pulls.merge({
      owner,
      repo,
      pull_number: prNumber,
      merge_method: 'squash',
      commit_title: `Auto-merge PR #${prNumber}`,
      commit_message: '🤖 Automatically merged by Miyabi Agent System',
    });

    // Delete the branch after merge
    try {
      const { data: pr } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
      });

      await this.octokit.git.deleteRef({
        owner,
        repo,
        ref: `heads/${pr.head.ref}`,
      });
    } catch (error) {
      // Branch deletion is optional, don't fail if it errors
      console.log(`[PRAgent] ⚠️  Could not delete branch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
