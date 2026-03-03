import React, { useEffect, useMemo, useState } from 'react';
import { socApi } from '../services/api';

export default function IncidentsPage({ severity, status }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    socApi.incidents().then(setItems);
  }, []);

  const filtered = useMemo(
    () => items.filter((i) => (severity === 'All' || i.risk.risk_level === severity) && (status === 'All' || i.status === status)),
    [items, severity, status],
  );

  return (
    <section className='panel'>
      <h3>All Incidents</h3>
      {filtered.map((i) => (
        <div className='incident-row' key={i.id}>#{i.id} {i.attack_name} • {i.status} • {i.risk.risk_level}</div>
      ))}
    </section>
  );
}
