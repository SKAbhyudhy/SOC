import React from 'react';
export default function AuditLogPanel({logs}){return <section className='panel'>{logs.slice(-5).map((l,i)=><div key={i}>{l.event}</div>)}</section>}
