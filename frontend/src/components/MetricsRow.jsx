import React from 'react';
export default function MetricsRow({metrics}){return <section className='panel'>Incidents {metrics.incidents||0} | Critical {metrics.critical||0} | High {metrics.high||0}</section>}
