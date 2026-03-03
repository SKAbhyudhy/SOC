import React from 'react';
export default function LiveIncidentFeed({incidents,onSelect}){return <section className='panel'>{incidents.map(i=><div key={i.id} onClick={()=>onSelect(i)} className='pulse'>#{i.id} {i.analysis?.classification} {i.risk?.risk_level}</div>)}</section>}
