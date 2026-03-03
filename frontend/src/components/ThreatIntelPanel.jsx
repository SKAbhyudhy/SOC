import React from 'react';
export default function ThreatIntelPanel({incident}){return <section className='panel'>Intel: {incident?.intel?.reputation_score ?? '-'}</section>}
