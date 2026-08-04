import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import { useAppSelector } from '../hooks/redux';
import type { ApiResponse, Property, RentalApplication, Ticket } from '../types';
import styles from './PageStyles.module.css';
interface LandlordData {
  totalProperties: number;
  availableProperties: number;
  rentedProperties: number;
  occupancyPercentage: number;
  pendingApplications: number;
  openTickets: number;
  emergencyTickets: number;
  recentApplications: RentalApplication[];
}
interface ResidentData {
  applications: RentalApplication[];
  openTickets: number;
  recentTickets: Ticket[];
  activeProperty?: Property;
}
export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const [data, setData] = useState<LandlordData | ResidentData>();
  const [error, setError] = useState('');
  useEffect(() => {
    api
      .get<ApiResponse<LandlordData | ResidentData>>('/dashboard')
      .then((r) => setData(r.data.data))
      .catch((e) => setError(getErrorMessage(e)));
  }, []);
  if (!data)
    return error ? (
      <div className="page">
        <div className="errorBanner">{error}</div>
      </div>
    ) : (
      <div className="loader" />
    );
  if (user.role === 'landlord') {
    const d = data as LandlordData;
    const statItems = [
      ['Total properties', d.totalProperties, 'Across your portfolio'],
      ['Available', d.availableProperties, 'Ready for applicants'],
      ['Pending applications', d.pendingApplications, 'Awaiting review'],
      ['Open maintenance', d.openTickets, `${d.emergencyTickets} emergency`],
    ] as const;
    return (
      <div className="page">
        <div className="pageHeading">
          <div>
            <p className="eyebrow">Portfolio pulse</p>
            <h1>Good morning, {user.fullName.split(' ')[0]}.</h1>
            <p className="muted">Here’s what needs your attention today.</p>
          </div>
          <Link to="/properties/new" className="button">
            ＋ Add property
          </Link>
        </div>
        <section className={styles.stats}>
          {statItems.map(([label, value, note]) => (
            <div className={`card ${styles.stat}`} key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </div>
          ))}
        </section>
        <section className={styles.contentGrid}>
          <div className={`card ${styles.panel}`}>
            <h2>Recent application activity</h2>
            <div className={styles.activity}>
              {d.recentApplications.length ? (
                d.recentApplications.map((a) => (
                  <div key={a._id}>
                    <i>⌂</i>
                    <span>
                      <strong>{a.applicant?.fullName ?? 'Applicant'}</strong>
                      <small>{a.property?.title}</small>
                    </span>
                    <span className={`pill ${a.status}`}>{a.status}</span>
                  </div>
                ))
              ) : (
                <div className="empty">No recent activity</div>
              )}
            </div>
          </div>
          <div className={`card ${styles.panel} ${styles.occupancy}`}>
            <h2>Portfolio occupancy</h2>
            <div
              className={styles.ring}
              style={{ '--value': d.occupancyPercentage } as React.CSSProperties}
            >
              <strong>{d.occupancyPercentage}%</strong>
            </div>
            <p className="muted">
              {d.rentedProperties} of {d.totalProperties} homes occupied
            </p>
          </div>
        </section>
      </div>
    );
  }
  const d = data as ResidentData;
  return (
    <div className="page">
      <div className="pageHeading">
        <div>
          <p className="eyebrow">Your homebase</p>
          <h1>Welcome back, {user.fullName.split(' ')[0]}.</h1>
          <p className="muted">A clear view of your home and applications.</p>
        </div>
        <Link to="/properties" className="button">
          Explore properties
        </Link>
      </div>
      <section className={styles.stats}>
        <div className={`card ${styles.stat}`}>
          <span>Applications</span>
          <strong>{d.applications.length}</strong>
          <small>Recent submissions</small>
        </div>
        <div className={`card ${styles.stat}`}>
          <span>Pending</span>
          <strong>{d.applications.filter((a) => a.status === 'pending').length}</strong>
          <small>Under review</small>
        </div>
        <div className={`card ${styles.stat}`}>
          <span>Open maintenance</span>
          <strong>{d.openTickets}</strong>
          <small>Active tickets</small>
        </div>
        <div className={`card ${styles.stat}`}>
          <span>Active home</span>
          <strong>{d.activeProperty ? '1' : '—'}</strong>
          <small>{d.activeProperty?.title ?? 'No active lease'}</small>
        </div>
      </section>
      <section className={styles.contentGrid}>
        <div className={`card ${styles.panel}`}>
          <h2>Application timeline</h2>
          <div className={styles.activity}>
            {d.applications.map((a) => (
              <div key={a._id}>
                <i>⌑</i>
                <span>
                  <strong>{a.property?.title ?? 'Property'}</strong>
                  <small>{new Date(a.createdAt).toLocaleDateString()}</small>
                </span>
                <span className={`pill ${a.status}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>
        {d.activeProperty && (
          <div className={`card ${styles.panel}`}>
            <p className="eyebrow">Active property</p>
            <h2>{d.activeProperty.title}</h2>
            <p className="muted">
              {d.activeProperty.address}
              <br />
              {d.activeProperty.city}, {d.activeProperty.state}
            </p>
            <Link className="button secondary" to="/maintenance">
              View maintenance
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
