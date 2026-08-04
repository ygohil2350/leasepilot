import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import { useAppSelector } from '../hooks/redux';
import type { ApiResponse, Property } from '../types';
import styles from './PageStyles.module.css';
export default function PropertyDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const [property, setProperty] = useState<Property>();
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    desiredMoveInDate: '',
    monthlyIncome: '',
    employmentStatus: 'Employed',
    employer: '',
    occupants: '1',
    message: '',
  });
  useEffect(() => {
    api
      .get<ApiResponse<Property>>(`/properties/${id}`)
      .then((r) => setProperty(r.data.data))
      .catch((e) => setError(getErrorMessage(e)));
  }, [id]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/applications', {
        property: id,
        ...form,
        monthlyIncome: Number(form.monthlyIncome),
        occupants: Number(form.occupants),
      });
      setSent(true);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };
  if (!property)
    return error ? (
      <div className="page">
        <div className="errorBanner">{error}</div>
      </div>
    ) : (
      <div className="loader" />
    );
  return (
    <div className="page">
      <Link
        to={(location.state as { from?: string } | null)?.from ?? '/properties'}
        className="muted"
      >
        ← Back to properties
      </Link>
      <div className={styles.detailGrid} style={{ marginTop: '1rem' }}>
        <div>
          <div className={styles.gallery}>
            {property.imageUrls.slice(0, 3).map((url, i) => (
              <img
                key={url}
                src={url}
                loading="lazy"
                alt={`${property.title} ${i === 0 ? 'exterior' : `interior view ${i}`}`}
              />
            ))}
          </div>
          <div className={styles.detailBody}>
            <span className={`pill ${property.listingStatus}`}>{property.listingStatus}</span>
            <h1>{property.title}</h1>
            <p className="muted">
              {property.address}, {property.city}, {property.state} {property.postalCode}
            </p>
            <div className={styles.features}>
              <span>{property.bedrooms} bedrooms</span>
              <span>{property.bathrooms} bathrooms</span>
              <span>{property.areaSqFt.toLocaleString()} ft²</span>
            </div>
            <h2>A home that works beautifully</h2>
            <p className="muted" style={{ lineHeight: 1.8 }}>
              {property.description}
            </p>
            <h3>Amenities</h3>
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              {property.amenities.map((a) => (
                <span className="pill" key={a}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
        <aside className={`card ${styles.asideCard}`}>
          <div className={styles.price}>
            ${property.monthlyRent.toLocaleString()} <small>/ month</small>
          </div>
          <p className="muted">Available {new Date(property.availableFrom).toLocaleDateString()}</p>
          {user?.role === 'landlord' ? (
            <Link
              className="button"
              to={`/properties/${property._id}/edit`}
              style={{ width: '100%' }}
            >
              Edit listing
            </Link>
          ) : sent ? (
            <div>
              <h3>Application sent ✓</h3>
              <p className="muted">You can follow its progress from Applications.</p>
              <Link to="/applications" className="button secondary">
                View applications
              </Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h3>Apply for this home</h3>
              <div className="field">
                <label>Desired move-in</label>
                <input
                  type="date"
                  min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                  required
                  value={form.desiredMoveInDate}
                  onChange={(e) => setForm({ ...form, desiredMoveInDate: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Monthly income</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.monthlyIncome}
                  onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Employment</label>
                <select
                  value={form.employmentStatus}
                  onChange={(e) => setForm({ ...form, employmentStatus: e.target.value })}
                >
                  <option>Employed</option>
                  <option>Self-employed</option>
                  <option>Student</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="field">
                <label>Occupants</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.occupants}
                  onChange={(e) => setForm({ ...form, occupants: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Message (optional)</label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              {error && <div className="errorBanner">{error}</div>}
              <button className="button">Submit application</button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
