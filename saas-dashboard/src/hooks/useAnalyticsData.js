import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export function useAnalyticsData() {
  const [summary, setSummary] = useState(null);
  const [lineSeries, setLineSeries] = useState([]);
  const [statusCount, setStatusCount] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [sum, perDay, status] = await Promise.all([
          api('/analytics/summary'),
          api('/analytics/requests-per-day?days=7'),
          api('/analytics/status-count'),
        ]);
        if (!cancelled) {
          setSummary(sum);
          setLineSeries(perDay);
          setStatusCount(status);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setSummary(null);
          setLineSeries([]);
          setStatusCount({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { summary, lineSeries, statusCount, loading, error };
}
