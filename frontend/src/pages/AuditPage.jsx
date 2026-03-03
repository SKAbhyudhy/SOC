import React, { useEffect, useState } from 'react';
import { socApi } from '../services/api';
export default function AuditPage(){const [l,setL]=useState([]); useEffect(()=>{socApi.audit().then(setL)},[]); return <div className='panel'>{l.map((x,i)=><div key={i}>{x.timestamp} {x.event}</div>)}</div>}
