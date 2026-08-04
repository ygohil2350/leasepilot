import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAppSelector } from '../hooks/redux';
import type { ApiResponse, RentalApplication } from '../types';
import styles from './PageStyles.module.css';
export default function ApplicationsPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const [items, setItems] = useState<RentalApplication[]>([]);
  const [error, setError] = useState('');
  const [review, setReview] = useState<{
    item: RentalApplication;
    status: 'approved' | 'rejected';
  }>();
  const load = () =>
    api
      .get<ApiResponse<RentalApplication[]>>('/applications')
      .then((r) => setItems(r.data.data))
      .catch((e) => setError(getErrorMessage(e)));
  useEffect(() => {
    void load();
  }, []);
  const confirm = async () => {
    if (!review) return;
    try {
      await api.patch(`/applications/${review.item._id}/status`, { status: review.status });
      setReview(undefined);
      load();
    } catch (e) {
      setError(getErrorMessage(e));
      setReview(undefined);
    }
  };
  return (
    <div className="page">
      <div className="pageHeading">
        <div>
          <p className="eyebrow">Leasing pipeline</p>
          <h1>{user.role === 'landlord' ? 'Applications to review' : 'Your applications'}</h1>
          <p className="muted">
            {user.role === 'landlord'
              ? 'Move qualified applicants forward with confidence.'
              : 'Track every step from submitted to decision.'}
          </p>
        </div>
      </div>
      {error && <div className="errorBanner">{error}</div>}
      <div className={`card ${styles.panel} ${styles.tableWrap}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Property</th>
              {user.role === 'landlord' && <th>Applicant</th>}
              <th>Move-in</th>
              <th>Income</th>
              <th>Status</th>
              <th>Submitted</th>
              {user.role === 'landlord' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>
                  <strong>{item.property?.title}</strong>
                  <br />
                  <small className="muted">{item.property?.city}</small>
                </td>
                {user.role === 'landlord' && (
                  <td>
                    {item.applicant?.fullName}
                    <br />
                    <small className="muted">{item.applicant?.email}</small>
                  </td>
                )}
                <td>{new Date(item.desiredMoveInDate).toLocaleDateString()}</td>
                <td>${item.monthlyIncome.toLocaleString()}</td>
                <td>
                  <span className={`pill ${item.status}`}>{item.status}</span>
                </td>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                {user.role === 'landlord' && (
                  <td>
                    <div className={styles.actions}>
                      {item.status === 'pending' ? (
                        <>
                          <button onClick={() => setReview({ item, status: 'approved' })}>
                            Approve
                          </button>
                          <button onClick={() => setReview({ item, status: 'rejected' })}>
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="muted">Reviewed</span>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <div className="empty">No applications yet.</div>}
      </div>
      {review && (
        <ConfirmDialog
          title={`${review.status === 'approved' ? 'Approve' : 'Reject'} this application?`}
          body={
            review.status === 'approved'
              ? 'This will assign the tenant and mark the property as rented.'
              : 'The applicant will see the rejected status immediately.'
          }
          confirmLabel={review.status === 'approved' ? 'Approve applicant' : 'Reject application'}
          onClose={() => setReview(undefined)}
          onConfirm={confirm}
        />
      )}
    </div>
  );
}
