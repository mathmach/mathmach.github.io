import { useEffect, useState } from 'react';
import type { Theme } from '../domain/types';
import { onDarkModeChange, prefersDarkMode } from '../infrastructure/mediaQuery';
import { readStorage, writeStorage } from '../infrastructure/storage';

function resolveInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = readStorage('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  if (prefersDarkMode()) return 'dark';
  return 'light';
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(resolveInitialTheme);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    writeStorage('theme', next);
  };

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('no-transition');
      });
    });
  }, []);

  useEffect(() => {
    return onDarkModeChange((isDark) => {
      const hasStoredPreference = readStorage('theme') !== null;
      if (!hasStoredPreference) {
        setThemeState(isDark ? 'dark' : 'light');
      }
    });
  }, []);

  return { theme, setTheme } as const;
}
