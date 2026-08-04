import type { Theme } from '../hooks/useTheme';
import styles from './ThemeToggle.module.css';
export const ThemeToggle = ({ theme, onToggle }: { theme: Theme; onToggle: () => void }) => (
  <button
    className={styles.toggle}
    onClick={onToggle}
    type="button"
    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
  >
    <span aria-hidden="true">{theme === 'light' ? '☾' : '☀'}</span>
    <span className={styles.label}>{theme === 'light' ? 'Dark' : 'Light'}</span>
  </button>
);
