import React from 'react';
export default function DistributionChart({incidents}){return <section className='panel'>Distribution: {incidents.map(i=>i.risk.risk_level).join(', ')}</section>}
