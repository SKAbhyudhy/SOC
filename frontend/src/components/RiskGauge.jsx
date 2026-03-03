import React from 'react';
export default function RiskGauge({incidents}){const avg=incidents.length?Math.round(incidents.reduce((a,b)=>a+b.risk.risk_score,0)/incidents.length):0;return <section className='panel'>Risk Gauge <div className='gauge' style={{['--p']:`${Math.min(100,avg*10)}%`}}>{avg}</div></section>}
