import React, { useEffect, useState } from 'react';
import { socApi } from '../services/api';
export default function AgentsPage(){const [a,setA]=useState([]); useEffect(()=>{socApi.agents().then(setA)},[]); return <div className='panel'>{JSON.stringify(a)}</div>}
