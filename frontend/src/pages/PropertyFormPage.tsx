import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import type { ApiResponse, Property } from '../types';
import styles from './PageStyles.module.css';
const blank = {
  title: '',
  description: '',
  propertyType: 'Apartment',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  monthlyRent: '',
  securityDeposit: '',
  bedrooms: '1',
  bathrooms: '1',
  areaSqFt: '',
  amenities: 'Parking, In-unit laundry',
  imageUrls:
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  listingStatus: 'available',
  availableFrom: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  x: '50',
  y: '50',
};
export default function PropertyFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (id)
      api
        .get<ApiResponse<Property>>(`/properties/${id}`)
        .then(({ data: { data: p } }) =>
          setForm({
            title: p.title,
            description: p.description,
            propertyType: p.propertyType,
            address: p.address,
            city: p.city,
            state: p.state,
            postalCode: p.postalCode,
            monthlyRent: String(p.monthlyRent),
            securityDeposit: String(p.securityDeposit),
            bedrooms: String(p.bedrooms),
            bathrooms: String(p.bathrooms),
            areaSqFt: String(p.areaSqFt),
            amenities: p.amenities.join(', '),
            imageUrls: p.imageUrls.join(', '),
            listingStatus: p.listingStatus,
            availableFrom: p.availableFrom.slice(0, 10),
            x: String(p.mapPosition.x),
            y: String(p.mapPosition.y),
          }),
        )
        .catch((e) => setError(getErrorMessage(e)));
  }, [id]);
  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const body = {
      ...form,
      monthlyRent: Number(form.monthlyRent),
      securityDeposit: Number(form.securityDeposit),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      areaSqFt: Number(form.areaSqFt),
      amenities: form.amenities
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      imageUrls: form.imageUrls
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      mapPosition: { x: Number(form.x), y: Number(form.y) },
      availableFrom: new Date(form.availableFrom),
      x: undefined,
      y: undefined,
    };
    try {
      const response = id
        ? await api.patch<ApiResponse<Property>>(`/properties/${id}`, body)
        : await api.post<ApiResponse<Property>>('/properties', body);
      navigate(`/properties/${response.data.data._id}`);
    } catch (e) {
      setError(getErrorMessage(e));
      setSaving(false);
    }
  };
  const fields: [string, string, string][] = [
    ['title', 'Property title', 'text'],
    ['propertyType', 'Property type', 'text'],
    ['address', 'Street address', 'text'],
    ['city', 'City', 'text'],
    ['state', 'State', 'text'],
    ['postalCode', 'Postal code', 'text'],
    ['monthlyRent', 'Monthly rent', 'number'],
    ['securityDeposit', 'Security deposit', 'number'],
    ['bedrooms', 'Bedrooms', 'number'],
    ['bathrooms', 'Bathrooms', 'number'],
    ['areaSqFt', 'Area (sq ft)', 'number'],
    ['availableFrom', 'Available from', 'date'],
    ['amenities', 'Amenities (comma separated)', 'text'],
    ['imageUrls', 'Image URLs (comma separated)', 'text'],
  ];
  return (
    <div className="page">
      <div className="pageHeading">
        <div>
          <p className="eyebrow">Portfolio editor</p>
          <h1>{id ? 'Edit property' : 'Add a new property'}</h1>
          <p className="muted">Give applicants an accurate, inviting view of the home.</p>
        </div>
      </div>
      <form className={`card ${styles.panel} ${styles.formGrid}`} onSubmit={submit}>
        {fields.map(([key, label, type]) => (
          <div
            className={`field ${key === 'amenities' || key === 'imageUrls' ? styles.wide : ''}`}
            key={key}
          >
            <label htmlFor={key}>{label}</label>
            <input
              id={key}
              type={type}
              required
              value={form[key as keyof typeof form]}
              onChange={(e) => set(key, e.target.value)}
            />
          </div>
        ))}
        <div className={`field ${styles.wide}`}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={5}
            minLength={20}
            required
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Listing status</label>
          <select value={form.listingStatus} onChange={(e) => set('listingStatus', e.target.value)}>
            <option value="draft">Draft</option>
            <option value="available">Available</option>
            <option value="rented">Rented</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="field">
          <label>Map position X / Y</label>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <input
              type="number"
              min="0"
              max="100"
              value={form.x}
              onChange={(e) => set('x', e.target.value)}
            />
            <input
              type="number"
              min="0"
              max="100"
              value={form.y}
              onChange={(e) => set('y', e.target.value)}
            />
          </div>
        </div>
        {error && <div className={`errorBanner ${styles.wide}`}>{error}</div>}
        <div
          className={styles.wide}
          style={{ display: 'flex', gap: '.7rem', justifyContent: 'flex-end' }}
        >
          <button type="button" className="button secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button className="button" disabled={saving}>
            {saving ? 'Saving…' : 'Save property'}
          </button>
        </div>
      </form>
    </div>
  );
}
