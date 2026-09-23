import { useState, useRef, useCallback } from 'react';
import {
  Sun,
  Moon,
  Check,
  Menu,
  X,
} from 'lucide-react';
import type { Lang } from '../../i18n';
import { translations } from '../../i18n';
import { buildNavLinks } from '../../domain/navigation';
import { useAppContext } from '../../AppContext';
import { useClickOutside } from '../../application/useClickOutside';
import { LiquidButton } from '../../components/ui/LiquidButton';
import { LiquidGlass } from '../../components/ui/LiquidGlass';
import { BrazilFlag, USAFlag, SpainFlag } from '../../components/Icons';
import type { FC } from 'react';

const LANGUAGES: { code: Lang; Flag: FC<{ className?: string; width?: number; height?: number }> }[] = [
  { code: 'pt', Flag: BrazilFlag },
  { code: 'en', Flag: USAFlag },
  { code: 'es', Flag: SpainFlag },
];

interface HeaderProps {
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
}

export function Header({ onMobileMenuToggle, mobileMenuOpen }: HeaderProps) {
  const { lang, setLang, theme, setTheme } = useAppContext();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];
  const currentLang = LANGUAGES.find(item => item.code === lang) || LANGUAGES[0];

  const closeLangDropdown = useCallback(() => setLangDropdownOpen(false), []);
  useClickOutside(langMenuRef, closeLangDropdown);

  const navLinks = buildNavLinks(t.nav);

  return (
    <header className="fixed top-3 sm:top-4 md:top-5 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none">
      <div className="w-full max-w-4xl flex items-center justify-between gap-3 sm:gap-4 pointer-events-none">
        <nav
          aria-label="Main Navigation"
          className="relative h-11 sm:h-12 rounded-full border border-[var(--card-border)] shadow-lg shadow-black/5 dark:shadow-black/30 pointer-events-auto"
        >
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <LiquidGlass preset="header" borderWidth={0} className="w-full h-full rounded-full" />
          </div>

          <div className="relative z-10 px-3.5 sm:px-5 h-full flex items-center gap-3 sm:gap-5 md:gap-6">
            <a
              href="#"
              className="text-base sm:text-lg font-bold font-['Syne'] tracking-wider shrink-0 flex items-center gap-1"
            >
              <span>MD</span>
              <span className="text-[var(--accent)]">.</span>
            </a>

            <div className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs sm:text-[13px] font-semibold text-secondary">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-full hover:text-[var(--text-color)] hover:bg-[var(--glass-tint-hover)] transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          <div className="relative" ref={langMenuRef}>
            <LiquidButton
              variant="icon"
              className="w-11 h-11 sm:w-12 sm:h-12"
              onClick={() => setLangDropdownOpen(prev => !prev)}
              aria-label="Select language"
              aria-expanded={langDropdownOpen}
              title={t.languages[lang]}
            >
              <currentLang.Flag className="w-5 h-3.5 rounded-[2px] shadow-sm" />
            </LiquidButton>

            <div
              ref={dropdownRef}
              className={`absolute right-0 top-full mt-2.5 w-44 z-50 origin-top-right rounded-2xl border border-[var(--card-border)] shadow-lg shadow-black/5 dark:shadow-black/30 transition-all ${
                langDropdownOpen
                  ? 'opacity-100 scale-100 visible pointer-events-auto duration-150 ease-out'
                  : 'opacity-0 scale-95 invisible pointer-events-none duration-100 ease-in'
              }`}
            >
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <LiquidGlass preset="header" borderRadius={16} borderWidth={0} className="w-full h-full rounded-2xl" />
              </div>

              <div className="relative z-10 p-1.5 flex flex-col gap-1 w-full">
                {LANGUAGES.map(item => {
                  const isSelected = lang === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        setLang(item.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'liquid-pill-accent font-bold'
                          : 'text-secondary hover:text-[var(--text-color)] hover:bg-[var(--glass-tint-hover)] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.Flag className="w-5 h-3.5 rounded-[2px] shadow-sm" />
                        <span>{t.languages[item.code]}</span>
                      </div>
                      {isSelected && <Check size={13} className="shrink-0 text-[var(--accent)]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <LiquidButton
            variant="icon"
            className="w-11 h-11 sm:w-12 sm:h-12"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </LiquidButton>

          <LiquidButton
            variant="prominentGlass"
            href="#contact"
            className="h-11 sm:h-12 px-4 sm:px-5.5 hidden lg:inline-flex items-center uppercase tracking-wider text-xs font-bold"
          >
            <span>{t.nav.talk}</span>
          </LiquidButton>

          <div className="lg:hidden shrink-0">
            <LiquidButton
              variant="icon"
              className="w-11 h-11 sm:w-12 sm:h-12"
              onClick={onMobileMenuToggle}
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </LiquidButton>
          </div>
        </div>
      </div>
    </header>
  );
}
