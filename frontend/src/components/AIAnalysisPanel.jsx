import React from 'react';
export default function AIAnalysisPanel({incident}){return <section className='panel'>AI reasoning: {incident?.analysis?.reasoning || 'Select incident'}</section>}
