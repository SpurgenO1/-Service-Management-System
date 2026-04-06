import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { SOCKET_URL, api } from '../lib/api.js';

export default function ChatPanel({ ticketId, token }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function loadHistory() {
      try {
        const list = await api(`/request/${ticketId}/messages?limit=100`);
        if (!cancelled) setMessages(list);
      } catch (e) {
        if (!cancelled) toast.error(e.message);
      }
    }
    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [ticketId]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.emit('join-ticket', ticketId, (ack) => {
      if (ack && !ack.ok) {
        toast.error(ack.error || 'Could not join chat room');
      }
    });

    socket.on('chat:message', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.emit('leave-ticket', ticketId);
      socket.disconnect();
    };
  }, [ticketId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const trimmed = text.trim();
    if (!trimmed || !socketRef.current) return;
    setSending(true);
    socketRef.current.emit('chat:message', { ticketId, message: trimmed }, (ack) => {
      setSending(false);
      if (ack && !ack.ok) {
        toast.error(ack.error || 'Message failed');
        return;
      }
      setText('');
    });
  }

  return (
    <div className="flex h-[420px] flex-col rounded-2xl border border-slate-200/80 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="border-b border-slate-200/80 px-4 py-3 dark:border-slate-700">
        <h3 className="font-semibold text-slate-900 dark:text-white">Request chat</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Real-time room for this ticket</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">No messages yet.</p>
        )}
        {messages.map((m) => (
          <div
            key={m._id}
            className="rounded-xl bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-900"
          >
            <p className="font-medium text-indigo-600 dark:text-indigo-400">
              {m.sender?.name || 'User'}
            </p>
            <p className="text-slate-700 dark:text-slate-200">{m.message}</p>
            <p className="mt-1 text-xs text-slate-400">
              {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-slate-200/80 p-3 dark:border-slate-700">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Type a message…"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        />
        <button
          type="button"
          disabled={sending || !text.trim()}
          onClick={send}
          className="flex shrink-0 items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Send
        </button>
      </div>
    </div>
  );
}
