/**
 * Configuration loader for Miyabi Framework
 */

import * as dotenv from 'dotenv';
import type { AgentConfig } from '../types/agent.js';

dotenv.config();

export function loadConfig(): AgentConfig {
  const githubToken = process.env.GITHUB_TOKEN;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const repository = process.env.REPOSITORY;
  const deviceIdentifier = process.env.DEVICE_IDENTIFIER || 'Unknown Device';
  const logDirectory = process.env.LOG_DIRECTORY || '.ai/logs';
  const reportDirectory = process.env.REPORT_DIRECTORY || '.ai/parallel-reports';

  if (!githubToken) {
    throw new Error('GITHUB_TOKEN is required in .env file');
  }

  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY is required in .env file');
  }

  if (!repository) {
    throw new Error('REPOSITORY is required in .env file (format: owner/repo)');
  }

  return {
    githubToken,
    anthropicApiKey,
    repository,
    deviceIdentifier,
    logDirectory,
    reportDirectory,
  };
}
