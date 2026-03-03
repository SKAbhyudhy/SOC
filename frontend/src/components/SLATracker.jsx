import React from 'react';
export default function SLATracker({sla}){return <section className='panel'>SLA: {sla.map(s=><div key={s.incident_id}>#{s.incident_id} {s.remaining_minutes}m</div>)}</section>}
