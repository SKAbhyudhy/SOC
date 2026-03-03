import React from 'react';

export default function AgentActivityPanel({ agents }) {
  return (
    <section className='panel'>
      {agents.map((entry, idx) => {
        const incidentId = entry.incident_id ?? entry.id ?? idx;
        const validated = entry.agents?.audit?.validated;
        return (
          <div key={incidentId}>
            Incident {incidentId}: {validated === undefined ? 'active' : validated ? 'validated' : 'pending'}
          </div>
        );
      })}
    </section>
  );
}
