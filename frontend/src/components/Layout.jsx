import React, { useState } from 'react';

import Topbar from './Topbar';
import AnalyticsPage from '../pages/AnalyticsPage';
import CasesPage from '../pages/CasesPage';
import DashboardPage from '../pages/DashboardPage';
import IncidentsPage from '../pages/IncidentsPage';

const tabs = ['Overview', 'Incidents', 'Cases', 'Analytics'];

export default function Layout() {
  const [tab, setTab] = useState('Overview');
  const [severity, setSeverity] = useState('All');
  const [status, setStatus] = useState('All');

  const pageByTab = {
    Overview: <DashboardPage severity={severity} status={status} />,
    Incidents: <IncidentsPage severity={severity} status={status} />,
    Cases: <CasesPage />,
    Analytics: <AnalyticsPage />,
  };

  return (
    <div>
      <Topbar tabs={tabs} tab={tab} setTab={setTab} />
      <div className='workspace'>
        <aside className='sidebar panel'>
          <h3>Filters</h3>
          <label>Severity</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option>All</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All</option>
            <option>Active</option>
            <option>Mitigated</option>
          </select>
        </aside>
        <main className='grid'>{pageByTab[tab]}</main>
      </div>
    </div>
  );
}
