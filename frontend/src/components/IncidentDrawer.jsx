import React from 'react';
export default function IncidentDrawer({incident,onClose}){if(!incident) return null; return <aside className='drawer'><button onClick={onClose}>Close</button><pre>{JSON.stringify(incident,null,2)}</pre></aside>}
