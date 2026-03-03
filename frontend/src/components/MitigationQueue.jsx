import React from 'react';
import { socApi } from '../services/api';
export default function MitigationQueue({incident}){if(!incident) return <section className='panel'>No incident selected</section>; return <section className='panel'><button onClick={()=>socApi.approveMitigation(incident.id)}>Approve</button><button onClick={()=>socApi.executeMitigation(incident.id)}>Execute</button></section>}
