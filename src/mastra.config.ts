import { Mastra } from '@mastra/core';
import { MemoryKV } from '@mastra/memory';
import { djAgent } from './agents/dj-agent.js';
import { djSessionWorkflow } from './workflows/dj-session-workflow.js';
import { agentBattleWorkflow } from './workflows/agent-battle-workflow.js';
import { technoAgent, festivalAgent, hiphopAgent, eclecticAgent } from './agents/dj-personas.js';

export const mastra = new Mastra({
  agents: [
    djAgent,
    technoAgent,
    festivalAgent,
    hiphopAgent,
    eclecticAgent,
  ],
  workflows: [
    djSessionWorkflow,
    agentBattleWorkflow,
  ],
  memory: new MemoryKV(),
});