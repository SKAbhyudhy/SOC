import React from 'react';
import { socApi } from '../services/api';

export default function Topbar({ tabs, tab, setTab }) {
  return (
    <header className='topbar'>
      <div className='brand'>🛡️ NEXUS SOC</div>
      <nav className='tabs'>
        {tabs.map((t) => (
          <button key={t} className={t === tab ? 'active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>
      <div className='topbar-right'>
        <span className='live-badge'>● LIVE MONITORING</span>
        <select onChange={(e) => socApi.switchTenant(e.target.value)}>
          <option value='default'>default</option>
          <option value='acme'>acme</option>
        </select>
      </div>
    </header>
  );
}
