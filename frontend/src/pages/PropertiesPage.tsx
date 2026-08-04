import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PropertyCard } from '../components/PropertyCard';
import { SimulatedMap } from '../components/SimulatedMap';
import { fetchProperties } from '../features/properties/propertiesSlice';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import styles from './PageStyles.module.css';
type View = 'split' | 'list' | 'map';
export default function PropertiesPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [view, setView] = useState<View>('split');
  const dispatch = useAppDispatch();
  const { items, total, pages, loading, error } = useAppSelector((s) => s.properties);
  const user = useAppSelector((s) => s.auth.user);
  const querySearch = params.get('q') ?? '';
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search === querySearch) return;
      const next = new URLSearchParams(window.location.search);
      if (search) next.set('q', search);
      else next.delete('q');
      next.set('page', '1');
      setParams(next, { replace: true });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [querySearch, search, setParams]);
  useEffect(() => {
    void dispatch(fetchProperties(params.toString()));
  }, [dispatch, params]);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setParams(next);
  };
  const page = Number(params.get('page') ?? 1);
  return (
    <div className="page">
      <div className="pageHeading">
        <div>
          <p className="eyebrow">Find your place</p>
          <h1>{user?.role === 'landlord' ? 'Property portfolio' : 'Homes with a point of view'}</h1>
          <p className="muted">Search thoughtfully managed homes across our neighborhoods.</p>
        </div>
        {user?.role === 'landlord' && (
          <Link className="button" to="/properties/new">
            ＋ Add property
          </Link>
        )}
      </div>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          aria-label="Search properties"
          placeholder="Search address, city, or style…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="City"
          value={params.get('city') ?? ''}
          onChange={(e) => update('city', e.target.value)}
        >
          <option value="">Every city</option>
          {['Austin', 'Denver', 'Seattle', 'Portland'].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Minimum bedrooms"
          value={params.get('minBedrooms') ?? ''}
          onChange={(e) => update('minBedrooms', e.target.value)}
        >
          <option value="">Any beds</option>
          <option value="1">1+ beds</option>
          <option value="2">2+ beds</option>
          <option value="3">3+ beds</option>
        </select>
        <select
          aria-label="Maximum rent"
          value={params.get('maxRent') ?? ''}
          onChange={(e) => update('maxRent', e.target.value)}
        >
          <option value="">Any price</option>
          <option value="2000">Under $2,000</option>
          <option value="3000">Under $3,000</option>
          <option value="4000">Under $4,000</option>
        </select>
        <select
          aria-label="Sort"
          value={params.get('sort') ?? 'newest'}
          onChange={(e) => update('sort', e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="size">Largest</option>
          <option value="name">Name</option>
        </select>
        <div className={styles.viewToggle}>
          {(['split', 'list', 'map'] as View[]).map((v) => (
            <button
              key={v}
              className={view === v ? styles.active : ''}
              onClick={() => setView(v)}
              aria-label={`${v} view`}
            >
              {v === 'split' ? '◫' : v === 'list' ? '☷' : '⌖'}
            </button>
          ))}
        </div>
        {params.toString() && (
          <button
            className="button secondary"
            onClick={() => {
              setSearch('');
              setParams({});
            }}
          >
            Clear
          </button>
        )}
      </div>
      {error && <div className="errorBanner">{error}</div>}
      {loading ? (
        <div className="loader" />
      ) : (
        <>
          <p className={styles.results}>
            {total} {total === 1 ? 'home' : 'homes'} found
          </p>
          <div
            className={`${styles.listingLayout} ${view === 'list' ? styles.listOnly : ''} ${view === 'map' ? styles.mapOnly : ''}`}
          >
            {view !== 'map' && (
              <div className={styles.propertyGrid}>
                {items.map((p) => (
                  <PropertyCard key={p._id} property={p} />
                ))}
              </div>
            )}
            {view !== 'list' && <SimulatedMap properties={items} />}
          </div>
          {pages > 1 && (
            <div className={styles.pagination}>
              <button disabled={page <= 1} onClick={() => update('page', String(page - 1))}>
                ← Previous
              </button>
              <span>
                Page {page} of {pages}
              </span>
              <button disabled={page >= pages} onClick={() => update('page', String(page + 1))}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
