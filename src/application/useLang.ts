import { useState, useEffect } from 'react';
import type { Lang } from '../domain/types';
import { readStorage, writeStorage } from '../infrastructure/storage';

function detectBrowserLang(): Lang {
  if (typeof navigator === 'undefined') return 'en';
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const lower = candidate.toLowerCase();
    if (lower.startsWith('pt')) return 'pt';
    if (lower.startsWith('es')) return 'es';
    if (lower.startsWith('en')) return 'en';
  }
  return 'en';
}

function resolveInitialLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  const stored = readStorage('lang');
  if (stored === 'en' || stored === 'pt' || stored === 'es') return stored;
  return detectBrowserLang();
}

export function useLang() {
  const [lang, setLangState] = useState<Lang>(resolveInitialLang);

  const setLang = (next: Lang) => {
    setLangState(next);
    writeStorage('lang', next);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      const hasStoredPreference = readStorage('lang') !== null;
      if (!hasStoredPreference) {
        setLangState(detectBrowserLang());
      }
    };
    window.addEventListener('languagechange', handler);
    return () => window.removeEventListener('languagechange', handler);
  }, []);

  return { lang, setLang } as const;
}
