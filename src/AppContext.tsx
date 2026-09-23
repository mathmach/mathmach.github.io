import { createContext, useContext, type ReactNode } from 'react';
import type { Lang } from './i18n';
import { useTheme } from './application/useTheme';
import { useLang } from './application/useLang';

interface AppContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
}

const Context = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLang();

  return (
    <Context.Provider value={{ lang, setLang, theme, setTheme }}>
      {children}
    </Context.Provider>
  );
}
