import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, getErrorMessage } from '../api/client';
import { useAppSelector } from '../hooks/redux';
import type { ApiResponse, Ticket } from '../types';
import styles from './PageStyles.module.css';
export default function MaintenancePage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const [items, setItems] = useState<Ticket[]>([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Plumbing',
    priority: 'medium',
    imageUrls: '',
  });
  const load = useCallback(
    () =>
      api
        .get<ApiResponse<Ticket[]>>(`/maintenance${filter ? `?status=${filter}` : ''}`)
        .then((r) => setItems(r.data.data))
        .catch((e) => setError(getErrorMessage(e))),
    [filter],
  );
  useEffect(() => {
    void load();
  }, [load]);
  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (!user.activeProperty) {
      setError('Your account does not have an active rental.');
      return;
    }
    try {
      await api.post('/maintenance', {
        ...form,
        property: user.activeProperty,
        imageUrls: form.imageUrls ? form.imageUrls.split(',').map((v) => v.trim()) : [],
      });
      setShowForm(false);
      setForm({
        title: '',
        description: '',
        category: 'Plumbing',
        priority: 'medium',
        imageUrls: '',
      });
      load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };
  const transition = async (ticket: Ticket) => {
    const next = ticket.status === 'open' ? 'in_progress' : 'resolved';
    try {
      await api.patch(`/maintenance/${ticket._id}/status`, {
        status: next,
        landlordNotes:
          next === 'resolved'
            ? 'Work completed and verified.'
            : 'A service professional has been assigned.',
      });
      load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };
  return (
    <div className="page">
      <div className="pageHeading">
        <div>
          <p className="eyebrow">Care & maintenance</p>
          <h1>{user.role === 'landlord' ? 'Service command center' : 'Your service requests'}</h1>
          <p className="muted">Keep every home safe, comfortable, and running smoothly.</p>
        </div>
        {user.role === 'tenant' && (
          <button className="button" onClick={() => setShowForm((v) => !v)}>
            ＋ New request
          </button>
        )}
      </div>
      {showForm && (
        <form
          className={`card ${styles.panel} ${styles.formGrid}`}
          onSubmit={create}
          style={{ marginBottom: '1rem' }}
        >
          <div className="field">
            <label>Title</label>
            <input
              required
              minLength={3}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>HVAC</option>
              <option>Appliance</option>
              <option>Other</option>
            </select>
          </div>
          <div className="field">
            <label>Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div className="field">
            <label>Image URLs (optional)</label>
            <input
              value={form.imageUrls}
              onChange={(e) => setForm({ ...form, imageUrls: e.target.value })}
            />
          </div>
          <div className={`field ${styles.wide}`}>
            <label>Description</label>
            <textarea
              rows={3}
              minLength={10}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className={styles.wide}>
            <button className="button">Submit request</button>
          </div>
        </form>
      )}
      {error && (
        <div className="errorBanner" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      <div className={styles.toolbar}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      <div className={`card ${styles.panel} ${styles.tableWrap}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Request</th>
              <th>Property</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th>Notes / Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((ticket) => (
              <tr key={ticket._id}>
                <td>
                  <strong>{ticket.title}</strong>
                  <br />
                  <small className="muted">{ticket.category}</small>
                </td>
                <td>{ticket.property?.title}</td>
                <td>
                  <span className={`pill ${ticket.priority}`}>{ticket.priority}</span>
                </td>
                <td>
                  <span className={`pill ${ticket.status}`}>{ticket.status.replace('_', ' ')}</span>
                </td>
                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                <td>
                  {user.role === 'landlord' && ticket.status !== 'resolved' ? (
                    <button className="button secondary" onClick={() => transition(ticket)}>
                      {ticket.status === 'open' ? 'Start work' : 'Resolve'}
                    </button>
                  ) : (
                    <small className="muted">{ticket.landlordNotes ?? 'No notes yet'}</small>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <div className="empty">No maintenance requests match this view.</div>}
      </div>
    </div>
  );
}
