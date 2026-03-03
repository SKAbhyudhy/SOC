import React, { useEffect, useState } from 'react';
import { socApi } from '../services/api';
export default function SIEMPage(){const [s,setS]=useState({}); useEffect(()=>{socApi.siem().then(setS)},[]); return <div className='panel'>Splunk: {s.splunk?.status} | Wazuh: {s.wazuh?.status}</div>}
