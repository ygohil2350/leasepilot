import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { logout } from '../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { useTheme } from '../hooks/useTheme';
import styles from './AppShell.module.css';
const links = [
  { to: '/', label: 'Overview', icon: '⌂' },
  { to: '/properties', label: 'Properties', icon: '⌑' },
  { to: '/applications', label: 'Applications', icon: '▤' },
  { to: '/maintenance', label: 'Maintenance', icon: '◇' },
];
export const AppShell = () => {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  return (
    <div className={`${styles.shell} ${collapsed ? styles.collapsed : ''}`}>
      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.logo}>
          <span>LP</span>
          <strong>LeasePilot</strong>
        </div>
        <nav>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? styles.active : '')}
            >
              <span className={styles.icon}>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={styles.sideFooter}>
          <button type="button" onClick={() => dispatch(logout())}>
            <span className={styles.icon}>↪</span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      {open && (
        <button
          className={styles.scrim}
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <button
              className={styles.mobileMenu}
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              ☰
            </button>
            <button
              className={styles.collapse}
              onClick={() => setCollapsed((v) => !v)}
              aria-label="Toggle sidebar"
            >
              {collapsed ? '»' : '«'}
            </button>
          </div>
          <div className={styles.topActions}>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <div className={styles.user}>
              <span className={styles.avatar}>
                {user?.fullName
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2) ?? 'LP'}
              </span>
              <div>
                <strong>{user?.fullName}</strong>
                <small>{user?.role}</small>
              </div>
            </div>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
