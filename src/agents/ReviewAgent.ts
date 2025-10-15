/**
 * ReviewAgent - Code quality scoring and static analysis
 */

import type { GeneratedCode, QualityScore, AgentResult } from '../types/agent.js';

export class ReviewAgent {
  async execute(generatedCode: GeneratedCode): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      console.log(`[ReviewAgent] 📊 Calculating quality score`);

      const qualityScore = await this.calculateQualityScore(generatedCode);

      const status = qualityScore.passed ? '✅' : '❌';
      console.log(`[ReviewAgent]    Score: ${qualityScore.total}/100 ${status}`);

      return {
        success: qualityScore.passed,
        data: qualityScore,
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

  private async calculateQualityScore(generatedCode: GeneratedCode): Promise<QualityScore> {
    // Simplified quality scoring
    // In production, this would run actual linters and analyzers

    let typescriptScore = 100;
    let eslintScore = 100;
    let securityScore = 100;
    let coverageScore = 0; // Would need actual test coverage

    for (const file of generatedCode.files) {
      // Check for TypeScript best practices
      if (!file.content.includes('export')) {
        typescriptScore -= 5;
      }

      // Check for error handling
      if (!file.content.includes('try') && !file.content.includes('catch')) {
        eslintScore -= 10;
      }

      // Check for security issues
      if (file.content.includes('eval(') || file.content.includes('Function(')) {
        securityScore -= 50;
      }

      // Check for JSDoc comments
      if (!file.content.includes('/**')) {
        eslintScore -= 5;
      }

      // Basic TypeScript syntax check
      if (!file.content.includes('interface') && !file.content.includes('type') && !file.content.includes('class')) {
        typescriptScore -= 10;
      }
    }

    // Estimate coverage based on code structure
    const hasTests = generatedCode.files.some((f) => f.path.includes('test') || f.path.includes('spec'));
    coverageScore = hasTests ? 80 : 0;

    const total = Math.round(
      (typescriptScore * 0.3 + eslintScore * 0.3 + securityScore * 0.2 + coverageScore * 0.2)
    );

    return {
      total,
      typescript: typescriptScore,
      eslint: eslintScore,
      security: securityScore,
      coverage: coverageScore,
      passed: total >= 80,
    };
  }
}
