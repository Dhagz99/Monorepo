export const getAgentUplines = (
  agent: any
) => {

  const uplines = [];

  if (agent.parentAgent) {
    uplines.push(agent.parentAgent);
  }

  if (
    agent.parentAgent?.parentAgent
  ) {
    uplines.push(
      agent.parentAgent.parentAgent
    );
  }

  return uplines;
};