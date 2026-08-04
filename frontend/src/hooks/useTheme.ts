import { useEffect, useState } from 'react';
export type Theme = 'light' | 'dark';
const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem('leasepilot-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('leasepilot-theme', theme);
  }, [theme]);
  return {
    theme,
    toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
  };
};
