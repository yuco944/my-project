#!/usr/bin/env node
/**
 * Agent Runner CLI - Orchestrates autonomous agent execution
 */

import { loadConfig } from '../lib/config.js';
import { CoordinatorAgent } from '../agents/CoordinatorAgent.js';
import { IssueAgent } from '../agents/IssueAgent.js';
import { CodeGenAgent } from '../agents/CodeGenAgent.js';
import { ReviewAgent } from '../agents/ReviewAgent.js';
import { PRAgent } from '../agents/PRAgent.js';
import type { Task, GeneratedCode, QualityScore } from '../types/agent.js';

interface CLIOptions {
  issue?: number;
  issues?: string;
  concurrency?: number;
  dryRun?: boolean;
  autoMerge?: boolean;
  logLevel?: string;
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  console.log('🤖 Autonomous Operations - Parallel Executor\n');

  // Load configuration
  let config;
  try {
    config = loadConfig();
    console.log('✅ Configuration loaded');
    console.log(`   Device: ${config.deviceIdentifier}`);
    console.log(`   Repository: ${config.repository}`);
    console.log(`   Concurrency: ${options.concurrency || 2}`);
    if (options.dryRun) {
      console.log('   Dry Run: Yes (no changes will be made)');
    }
    if (options.autoMerge) {
      console.log('   Auto-Merge: Enabled ✅');
    }
    console.log('');
  } catch (error) {
    console.error('❌ Configuration error:',error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }

  // Get issue numbers to process
  const issueNumbers = getIssueNumbers(options);

  if (issueNumbers.length === 0) {
    console.error('❌ No issue number provided. Use --issue <number> or --issues <n1,n2,...>');
    process.exit(1);
  }

  // Process each issue
  for (const issueNumber of issueNumbers) {
    // Use CLI flag if provided, otherwise use env variable default
    const autoMerge = options.autoMerge !== undefined
      ? options.autoMerge
      : process.env.AUTO_MERGE === 'true';

    await processIssue(issueNumber, config, options.dryRun || false, autoMerge);
  }
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--issue' && args[i + 1]) {
      options.issue = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--issues' && args[i + 1]) {
      options.issues = args[i + 1];
      i++;
    } else if (arg === '--concurrency' && args[i + 1]) {
      options.concurrency = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--auto-merge') {
      options.autoMerge = true;
    } else if (arg === '--log-level' && args[i + 1]) {
      options.logLevel = args[i + 1];
      i++;
    }
  }

  return options;
}

function getIssueNumbers(options: CLIOptions): number[] {
  if (options.issue) {
    return [options.issue];
  }

  if (options.issues) {
    return options.issues.split(',').map((n) => parseInt(n.trim(), 10));
  }

  return [];
}

async function processIssue(issueNumber: number, config: ReturnType<typeof loadConfig>, dryRun: boolean, autoMerge: boolean) {
  console.log('='.repeat(80));
  console.log(`🚀 Executing Issue #${issueNumber}`);
  console.log('='.repeat(80));
  console.log('');

  try {
    // Step 1: IssueAgent - Fetch and analyze issue
    const issueAgent = new IssueAgent(config);
    const issueResult = await issueAgent.execute(issueNumber);

    if (!issueResult.success) {
      throw new Error(`IssueAgent failed: ${issueResult.error}`);
    }

    const issueData = (issueResult.data as { issue: any }).issue;

    // Step 2: CoordinatorAgent - Decompose tasks
    const coordinatorAgent = new CoordinatorAgent();
    const coordResult = await coordinatorAgent.execute(issueData);

    if (!coordResult.success) {
      throw new Error(`CoordinatorAgent failed: ${coordResult.error}`);
    }

    const { tasks } = coordResult.data as { tasks: Task[] };

    // Step 3: CodeGenAgent - Generate code
    const codeGenAgent = new CodeGenAgent(config);
    const codeGenResult = await codeGenAgent.execute(issueData, tasks);

    if (!codeGenResult.success) {
      throw new Error(`CodeGenAgent failed: ${codeGenResult.error}`);
    }

    const generatedCode = codeGenResult.data as GeneratedCode;

    // Step 4: ReviewAgent - Quality check
    const reviewAgent = new ReviewAgent();
    const reviewResult = await reviewAgent.execute(generatedCode);

    const qualityScore = reviewResult.data as QualityScore;

    if (!reviewResult.success) {
      console.log(`\n❌ Quality score: ${qualityScore.total}/100 (Failed)`);
      console.log('   Code quality does not meet requirements (≥80 points)');
      throw new Error('Quality check failed');
    }

    // Step 5: PRAgent - Create Pull Request
    if (!dryRun) {
      const prAgent = new PRAgent(config);
      const prResult = await prAgent.execute(issueData, generatedCode, autoMerge);

      if (!prResult.success) {
        throw new Error(`PRAgent failed: ${prResult.error}`);
      }

      const prData = prResult.data as { number: number; url: string };

      console.log(`\n✅ Issue #${issueNumber} completed successfully`);
      console.log(`   PR: #${prData.number}`);
      console.log(`   URL: ${prData.url}`);
      if (autoMerge) {
        console.log(`   Status: Merged ✅`);
      }
    } else {
      console.log(`\n✅ Dry run completed for Issue #${issueNumber}`);
      console.log('   No changes were made');
    }
  } catch (error) {
    console.error(`\n❌ Failed to process Issue #${issueNumber}:`);
    console.error(`   ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
🤖 Autonomous Operations - Agent Runner

Usage:
  npm run agents:parallel:exec -- [options]

Options:
  --issue <number>          Process single issue
  --issues <n1,n2,...>      Process multiple issues (comma-separated)
  --concurrency <number>    Number of concurrent executions (default: 2)
  --dry-run                 Run without making changes
  --auto-merge              Automatically merge PR after creation (requires quality ≥80)
  --log-level <level>       Log level (default: info)
  --help, -h                Show this help

Examples:
  npm run agents:parallel:exec -- --issue 2
  npm run agents:parallel:exec -- --issue 2 --auto-merge
  npm run agents:parallel:exec -- --issues 2,3,4 --concurrency 3
  npm run agents:parallel:exec -- --issue 2 --dry-run

Environment Variables (required in .env):
  GITHUB_TOKEN              GitHub Personal Access Token
  ANTHROPIC_API_KEY         Anthropic API Key
  REPOSITORY                Repository (format: owner/repo)
  DEVICE_IDENTIFIER         Device name for logging
`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
