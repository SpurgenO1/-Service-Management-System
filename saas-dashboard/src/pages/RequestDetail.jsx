import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Upload } from 'lucide-react';
import { api, API_URL, getToken } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ChatPanel from '../components/ChatPanel.jsx';

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const t = await api(`/request/${id}`);
      setTicket(t);
    } catch (e) {
      toast.error(e.message);
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const token = getToken();
      const res = await fetch(`${API_URL}/request/${id}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setTicket(data);
      toast.success('File uploaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function updateStatus(body) {
    try {
      const updated = await api(`/request/${id}`, { method: 'PUT', body });
      setTicket(updated);
      toast.success('Status updated');
    } catch (e) {
      toast.error(e.message);
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading ticket…</p>;
  }
  if (!ticket) {
    return (
      <p className="text-slate-500">
        Ticket not found. <Link to="/requests" className="text-indigo-600">Back</Link>
      </p>
    );
  }

  const token = getToken();
  const role = user?.role;

  return (
    <div className="space-y-6">
      <Link
        to="/requests"
        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        <ArrowLeft className="h-4 w-4" />
        All requests
      </Link>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{ticket.title}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{ticket.description}</p>
            <p className="mt-2 text-sm text-slate-500">
              Status: <strong>{ticket.status}</strong> · Priority: <strong>{ticket.priority}</strong>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {role === 'developer' && ticket.status !== 'In Progress' && (
              <button
                type="button"
                onClick={() => updateStatus({ status: 'In Progress' })}
                className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Start (In Progress)
              </button>
            )}
            {role === 'tester' && ticket.status === 'In Progress' && (
              <button
                type="button"
                onClick={() => updateStatus({ status: 'Testing' })}
                className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Move to Testing
              </button>
            )}
            {role === 'admin' && (
              <button
                type="button"
                onClick={() => updateStatus({ status: 'Completed' })}
                className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Mark completed
              </button>
            )}
          </div>
        </div>

        {ticket.aiInsights?.possibleCause && (
          <div className="mt-6 rounded-2xl border border-violet-200/80 bg-violet-50/80 p-4 dark:border-violet-900/50 dark:bg-violet-950/40">
            <h3 className="font-semibold text-violet-900 dark:text-violet-200">AI triage</h3>
            <p className="mt-1 text-sm text-violet-800 dark:text-violet-300">
              <strong>Possible cause:</strong> {ticket.aiInsights.possibleCause}
            </p>
            <p className="mt-2 text-sm text-violet-800 dark:text-violet-300">
              <strong>Suggested fix:</strong> {ticket.aiInsights.suggestedFix}
            </p>
          </div>
        )}

        <div className="mt-6">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading…' : 'Upload image or document'}
            <input type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={onFile} disabled={uploading} />
          </label>
          {ticket.attachments?.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {ticket.attachments.map((a, i) => (
                <li key={i}>
                  <a
                    href={`${API_URL}${a.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {a.originalName || a.url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {token && <ChatPanel ticketId={id} token={token} />}
    </div>
  );
}
