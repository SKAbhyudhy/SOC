import React from 'react';
import { socApi } from '../services/api';
export default function IngestionPage(){return <div className='panel'><button onClick={()=>socApi.ingestDataset()}>Start Dataset Ingestion</button><button onClick={()=>socApi.toggleScheduler(true)}>Enable Scheduler</button></div>}
