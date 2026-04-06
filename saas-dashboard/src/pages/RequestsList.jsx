import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function RequestsList() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [creating, setCreating] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await api('/requests');
      setItems(data);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function createRequest(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await api('/request', {
        method: 'POST',
        body: { title, description, priority },
      });
      toast.success('Request created', {
        description: created.aiInsights?.possibleCause
          ? 'AI added triage hints — open the ticket to read them.'
          : undefined,
      });
      setTitle('');
      setDescription('');
      setShowForm(false);
      setItems((prev) => [created, ...prev]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Requests</h1>
          <p className="text-slate-500 dark:text-slate-400">Open a ticket to chat and upload files.</p>
        </div>
        {user?.role === 'client' && (
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            New request
          </button>
        )}
      </div>

      {showForm && user?.role === 'client' && (
        <form
          onSubmit={createRequest}
          className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="font-semibold text-slate-900 dark:text-white">Create request</h2>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-xl border border-slate-200 px-4 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue…"
            rows={4}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {creating ? 'Saving…' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-slate-500">No requests yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((t) => (
            <li key={t._id}>
              <Link
                to={`/request/${t._id}`}
                className="block rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-600"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">{t.title}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {t.status}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                  {t.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
