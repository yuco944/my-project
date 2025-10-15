/**
 * CoordinatorAgent - Task decomposition and DAG orchestration
 */

import type { IssueData, Task, DAG, AgentResult } from '../types/agent.js';

export class CoordinatorAgent {
  async execute(issue: IssueData): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      console.log(`[CoordinatorAgent] 🔍 Decomposing Issue #${issue.number}`);

      const tasks = this.decomposeTasks(issue);
      console.log(`[CoordinatorAgent]    Found ${tasks.length} tasks`);

      const dag = this.buildDAG(tasks);
      console.log(`[CoordinatorAgent] 🔗 Building task dependency graph (DAG)`);
      console.log(`[CoordinatorAgent]    Graph: ${dag.nodes.length} nodes, ${dag.edges.length} edges, ${dag.levels} levels`);

      const hasCircularDeps = this.detectCircularDependencies(dag);
      if (hasCircularDeps) {
        throw new Error('Circular dependencies detected in task graph');
      }

      console.log(`[CoordinatorAgent] ✅ No circular dependencies found`);

      return {
        success: true,
        data: { tasks, dag },
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

  private decomposeTasks(issue: IssueData): Task[] {
    const tasks: Task[] = [];

    // Parse requirements from issue body
    const lines = issue.body.split('\n');
    let inRequirements = false;

    for (const line of lines) {
      if (line.includes('## 📋 要件')) {
        inRequirements = true;
        continue;
      }

      if (inRequirements && line.startsWith('##')) {
        inRequirements = false;
      }

      if (inRequirements && line.trim().startsWith('- [ ]')) {
        const description = line.replace('- [ ]', '').trim();
        tasks.push({
          id: `task-${tasks.length + 1}`,
          description,
          dependencies: [],
          status: 'pending',
        });
      }
    }

    // Add default tasks if no requirements found
    if (tasks.length === 0) {
      tasks.push({
        id: 'task-1',
        description: issue.title,
        dependencies: [],
        status: 'pending',
      });
    }

    return tasks;
  }

  private buildDAG(tasks: Task[]): DAG {
    // For now, simple sequential DAG (no dependencies)
    // In a real implementation, we'd analyze task relationships
    return {
      nodes: tasks,
      edges: [],
      levels: 1,
    };
  }

  private detectCircularDependencies(dag: DAG): boolean {
    // Simple cycle detection using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const dependencies = dag.edges
        .filter((edge) => edge.from === nodeId)
        .map((edge) => edge.to);

      for (const depId of dependencies) {
        if (!visited.has(depId)) {
          if (hasCycle(depId)) {
            return true;
          }
        } else if (recursionStack.has(depId)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of dag.nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) {
          return true;
        }
      }
    }

    return false;
  }
}
