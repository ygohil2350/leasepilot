import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { login } from '../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { useTheme } from '../hooks/useTheme';
import styles from './LoginPage.module.css';
const demos = [
  { label: 'Landlord', email: 'landlord@leasepilot.demo' },
  { label: 'Tenant', email: 'tenant@leasepilot.demo' },
  { label: 'Applicant', email: 'applicant@leasepilot.demo' },
];
export default function LoginPage() {
  const [email, setEmail] = useState(demos[0].email);
  const [password, setPassword] = useState('Demo123!');
  const { theme, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((s) => s.auth);
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    void dispatch(login({ email, password }));
  };
  return (
    <main className={styles.page}>
      <section className={styles.story}>
        <div className={styles.brand}>
          <span>LP</span>LeasePilot
        </div>
        <div className={styles.copy}>
          <span>PROPERTY OPERATIONS, CALM AT LAST</span>
          <h1>
            Every door.
            <br />
            One clear view.
          </h1>
          <p>
            LeasePilot brings listings, applications, residents, and maintenance into one considered
            workspace.
          </p>
          <div className={styles.quote}>
            “We spend less time chasing updates and more time improving the resident experience.”
            <small>— Maya Chen, Arbor House Partners</small>
          </div>
        </div>
        <div className={styles.orbit}>
          <span />
          <span />
          <span />
        </div>
      </section>
      <section className={styles.formSide}>
        <div className={styles.theme}>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <form onSubmit={submit}>
          <div className={styles.mobileBrand}>LeasePilot</div>
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to your workspace</h2>
          <p className="muted">Use a demo profile to explore each role.</p>
          <div className={styles.demos}>
            {demos.map((d) => (
              <button
                type="button"
                key={d.email}
                onClick={() => setEmail(d.email)}
                className={email === d.email ? styles.selected : ''}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="errorBanner">{error}</div>}
          <button className={`button ${styles.submit}`} disabled={loading}>
            {loading ? 'Signing in…' : 'Enter LeasePilot'} <span>→</span>
          </button>
          <small className={styles.hint}>
            Demo password: <strong>Demo123!</strong>
          </small>
        </form>
      </section>
    </main>
  );
}
