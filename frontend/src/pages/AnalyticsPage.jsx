import React, { useEffect, useState } from 'react';
import { socApi } from '../services/api';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    socApi.analytics().then(setAnalytics);
  }, []);

  return (
    <section className='panel'>
      <h3>Analytics</h3>
      <p>Total incidents: {analytics.total_incidents || 0}</p>
      <p>Resolved: {analytics.resolved || 0}</p>
      <p>Avg risk: {analytics.avg_risk || 0}</p>
      <p>Estimated time saved: {analytics.estimated_time_saved_minutes || 0} minutes</p>
    </section>
  );
}
