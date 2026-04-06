import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const STATUS_ORDER = ['Open', 'In Progress', 'Testing', 'Completed'];
const STATUS_COLORS = [
  'rgb(251, 191, 36)',
  'rgb(99, 102, 241)',
  'rgb(56, 189, 248)',
  'rgb(34, 197, 94)',
];

/**
 * @param {Array<{ date: string, count: number }>} lineSeries — from GET /analytics/requests-per-day
 * @param {Record<string, number>} statusCount — from GET /analytics/status-count
 */
export default function Charts({ darkMode = false, lineSeries = [], statusCount = {} }) {
  const isDark = darkMode;

  const lineChartData = useMemo(() => {
    const labels = lineSeries.map((r) => {
      const d = r.date;
      if (!d) return '';
      const parts = d.split('-');
      if (parts.length === 3) {
        return `${parts[1]}/${parts[2]}`;
      }
      return d;
    });
    const data = lineSeries.map((r) => r.count);
    return {
      labels: labels.length ? labels : ['—'],
      datasets: [
        {
          label: 'Requests',
          data: data.length ? data : [0],
          fill: true,
          tension: 0.4,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(99, 102, 241)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [lineSeries]);

  const pieChartData = useMemo(() => {
    const labels = [];
    const data = [];
    const colors = [];
    STATUS_ORDER.forEach((key, i) => {
      const n = statusCount[key] || 0;
      labels.push(key);
      data.push(n);
      colors.push(STATUS_COLORS[i] || 'rgb(148, 163, 184)');
    });
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
  }, [statusCount]);

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDark ? '#e2e8f0' : '#0f172a',
          bodyColor: isDark ? '#cbd5e1' : '#475569',
          borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.3)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: isDark ? '#94a3b8' : '#64748b',
            font: { size: 12 },
          },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)',
          },
          ticks: {
            color: isDark ? '#94a3b8' : '#64748b',
            font: { size: 12 },
            precision: 0,
          },
          border: { display: false },
        },
      },
    }),
    [isDark]
  );

  const pieOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: isDark ? '#cbd5e1' : '#475569',
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 12 },
          },
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDark ? '#e2e8f0' : '#0f172a',
          bodyColor: isDark ? '#cbd5e1' : '#475569',
          borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.3)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
        },
      },
    }),
    [isDark]
  );

  return (
    <div id="charts" className="grid gap-6 lg:grid-cols-5 scroll-mt-24">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Requests per day</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">From your analytics API</p>
          </div>
        </div>
        <div className="h-72">
          <Line data={lineChartData} options={lineOptions} />
        </div>
      </div>
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Status distribution</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Scoped to your role</p>
        </div>
        <div className="mx-auto flex h-64 max-w-xs items-center justify-center">
          <Pie data={pieChartData} options={pieOptions} />
        </div>
      </div>
    </div>
  );
}
