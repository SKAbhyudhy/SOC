import React from 'react';
export default function MITREGrid({incidents}){return <section className='panel'>{incidents.map(i=><div key={i.id}>{i.mitre?.technique_id} {i.mitre?.tactic}</div>)}</section>}
