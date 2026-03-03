import React, { useEffect, useMemo, useState } from 'react';
import { socApi } from '../services/api';

function reportText(incident) {
  if (!incident) return 'Select an incident and click Learn to view the executive report.';
  return `${incident.attack_name} detected from ${incident.source_ip}. Impacted asset: ${incident.log.asset}. Business impact: elevated risk (${incident.risk.risk_score}/100). Required action: execute mitigation playbook and validate controls.`;
}

export default function DashboardPage({ severity, status }) {
  const [metrics, setMetrics] = useState({});
  const [incidents, setIncidents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [terminal, setTerminal] = useState([]);

  useEffect(() => {
    let socket;
    let reconnectTimeout;

    const load = async () => {
      setMetrics(await socApi.dashboard());
      setIncidents(await socApi.incidents());
    };

    const connectWs = () => {
      socket = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/live');
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (Array.isArray(data.incidents)) setIncidents(data.incidents);
      };
      socket.onclose = () => {
        reconnectTimeout = setTimeout(connectWs, 2000);
      };
    };

    load();
    connectWs();
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socket) socket.close();
    };
  }, []);

  const filtered = useMemo(
    () => incidents.filter((i) => (severity === 'All' || i.risk.risk_level === severity) && (status === 'All' || i.status === status)),
    [incidents, severity, status],
  );

  const execute = async (incidentId) => {
    const result = await socApi.executeMitigation(incidentId);
    setTerminal(result.terminal || []);
    setIncidents(await socApi.incidents());
    setMetrics(await socApi.dashboard());
  };

  return (
    <>
      <section className='panel metric-row'>
        <div><h4>Critical</h4><strong>{metrics.critical || 0}</strong></div>
        <div><h4>High</h4><strong>{metrics.high || 0}</strong></div>
        <div><h4>Risk Score</h4><strong>{metrics.risk_score || 0}</strong></div>
        <div><h4>Mitigated</h4><strong>{metrics.mitigated || 0}</strong></div>
      </section>

      <section className='panel'>
        <h3>Incident List</h3>
        {filtered.map((incident) => (
          <div className='incident-row' key={incident.id}>
            <div>
              <strong>{incident.attack_name}</strong>
              <p>{incident.source_ip} • {new Date(incident.created_at).toLocaleTimeString()} • Risk {incident.risk.risk_score}</p>
            </div>
            <div className='actions'>
              <button onClick={() => { setSelected(incident); setReportOpen(true); }}>Learn</button>
              <button className='execute' onClick={() => execute(incident.id)}>Execute</button>
            </div>
          </div>
        ))}
      </section>

      <section className='panel'>
        <h3>Terminal View</h3>
        <div className='terminal'>
          {terminal.map((line, idx) => (
            <div key={idx} className={`line ${line.level}`}>{line.message}</div>
          ))}
        </div>
      </section>

      {reportOpen && (
        <section className='drawer'>
          <button onClick={() => setReportOpen(false)}>Close</button>
          <h3>Incident Report</h3>
          <p>{reportText(selected)}</p>
          <ul>
            <li>Executive summary and timeline</li>
            <li>Affected systems and business impact</li>
            <li>Required actions and validation steps</li>
          </ul>
        </section>
      )}
    </>
  );
}
