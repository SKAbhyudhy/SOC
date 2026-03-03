import React, { useEffect, useState } from 'react';
import { socApi } from '../services/api';

export default function CasesPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    socApi.cases().then(setItems);
  }, []);

  return (
    <section className='panel'>
      <h3>Cases & Forensics</h3>
      {items.map((c) => (
        <div key={c.id} className='case-row'>
          <strong>Case {c.id}</strong> • {c.status}
          {c.resolution && (
            <p>
              Safety {c.resolution.safety_before.toFixed(1)} → {c.resolution.safety_after.toFixed(1)} | AI {c.resolution.ai_time_seconds}s vs Human {c.resolution.human_time_minutes}m
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
