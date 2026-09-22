import React, { useState, useEffect, useRef, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  ShieldCheck, 
  ChevronRight, 
  ChevronDown,
  Check,
  Sun, 
  Moon, 
  CheckCircle2, 
  Layers, 
  Activity, 
  Cpu, 
  GitBranch, 
  Sparkles,
  Menu,
  X,
  RotateCcw,
  BookOpen,
  Radar
} from 'lucide-react';
import { translations, Lang, Job, MethodologyPillar, TechCategory, HeroStat } from './i18n';
import { DocsReader } from './components/DocsReader';
import { HeroExperience } from './HeroExperience';
import { GithubIcon, LinkedinIcon, BrazilFlag, USAFlag, SpainFlag } from './components/Icons';
import { LiquidCard } from './components/LiquidCard';
import { LiquidWaterCanvas } from './components/LiquidWaterCanvas';

const AppContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
}>({ lang: 'pt', setLang: () => {}, theme: 'dark', setTheme: () => {} });

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 25 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const LANGUAGES: { code: Lang; Flag: React.FC<{ className?: string; width?: number; height?: number }> }[] = [
  { code: 'pt', Flag: BrazilFlag },
  { code: 'en', Flag: USAFlag },
  { code: 'es', Flag: SpainFlag },
];

export default function App() {
  const [lang, setLang] = useState<Lang>('pt');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const t = translations[lang];
  const currentLang = LANGUAGES.find(item => item.code === lang) || LANGUAGES[0];

  const getPillarIcon = (index: number) => {
    switch (index) {
      case 0: return <Layers className="text-[#0369a1] dark:text-[#00f2fe]" size={26} />;
      case 1: return <ShieldCheck className="text-[#0369a1] dark:text-[#00f2fe]" size={26} />;
      case 2: return <Activity className="text-[#0369a1] dark:text-[#00f2fe]" size={26} />;
      case 3: return <GitBranch className="text-[#0369a1] dark:text-[#00f2fe]" size={26} />;
      case 4: return <Cpu className="text-[#0369a1] dark:text-[#00f2fe]" size={26} />;
      case 5: return <Radar className="text-[#0369a1] dark:text-[#00f2fe]" size={26} />;
      default: return <Sparkles className="text-[#0369a1] dark:text-[#00f2fe]" size={26} />;
    }
  };

  const navLinks = [
    { href: '#methodology', label: t.nav.methodology },
    { href: '#experience', label: t.nav.exp },
    { href: '#tech', label: t.nav.tech },
    { href: '#docs', label: t.nav.docs },
  ];

  return (
    <AppContext.Provider value={{ lang, setLang, theme, setTheme }}>
      <div className="w-full min-h-[100dvh] overflow-x-hidden selection:bg-[#0369a1]/30 dark:selection:bg-[#00f2fe]/30">
        
        <header className="fixed top-3 sm:top-4 md:top-5 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none">
          <nav 
            className="w-full max-w-4xl relative glass-card rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 flex justify-between items-center shadow-lg shadow-black/5 dark:shadow-black/30 pointer-events-auto border border-[var(--card-border)] bg-[var(--bg-color)]/80 backdrop-blur-2xl"
          >
            <LiquidWaterCanvas />

            <a href="#" className="relative z-10 text-base sm:text-lg font-bold font-['Syne'] tracking-wider shrink-0 flex items-center gap-1">
              <span>MD</span>
              <span className="text-[#0369a1] dark:text-[#00f2fe]">.</span>
            </a>
            
            <div className="relative z-10 hidden lg:flex gap-1 xl:gap-1.5 text-xs sm:text-[13px] font-medium text-muted">
              {navLinks.map((link) => (
                <a 
                  key={link.href} 
                  href={link.href} 
                  className="px-3 py-1.5 rounded-full hover:text-[var(--text-color)] hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="relative z-10 flex items-center gap-1.5 sm:gap-2">
              <div className="relative" ref={langMenuRef}>
                <button 
                  onClick={() => setLangDropdownOpen(prev => !prev)}
                  className="liquid-pill flex items-center gap-1.5 bg-[var(--card-bg)] hover:bg-[var(--card-border)]/50 rounded-full px-2.5 py-1.5 border border-[var(--card-border)] text-xs font-bold text-[var(--text-color)] transition-colors focus:outline-none cursor-pointer"
                  aria-label="Select language"
                  aria-expanded={langDropdownOpen}
                >
                  <currentLang.Flag className="w-4.5 h-3" />
                  <ChevronDown size={11} className={`text-muted transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {langDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-40 rounded-2xl border border-black/10 dark:border-white/15 shadow-2xl shadow-black/20 dark:shadow-black/80 z-50 bg-white dark:bg-[#111216] p-1.5 flex flex-col gap-0.5"
                    >
                      {LANGUAGES.map(item => {
                        const isSelected = lang === item.code;
                        return (
                          <button
                            key={item.code}
                            onClick={() => {
                              setLang(item.code);
                              setLangDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#0369a1]/15 dark:bg-[#00f2fe]/15 text-[#0369a1] dark:text-[#00f2fe] font-bold'
                                : 'text-[var(--text-color)] hover:bg-black/5 dark:hover:bg-white/5 font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <item.Flag className="w-5 h-3.5" />
                              <span>{t.languages[item.code]}</span>
                            </div>
                            {isSelected && <Check size={13} className="shrink-0 text-[#0369a1] dark:text-[#00f2fe]" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 rounded-full glass-card liquid-pill hover:scale-105 transition-transform cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              
              <a href="#contact" className="hidden lg:block relative overflow-hidden px-3.5 py-1.5 bg-[var(--text-color)] text-[var(--bg-color)] rounded-full text-[11px] font-bold uppercase tracking-wider liquid-pill hover:scale-105 transition-transform shadow-md cursor-pointer">
                <LiquidWaterCanvas />
                <span className="relative z-10">{t.nav.talk}</span>
              </a>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-full glass-card liquid-pill hover:scale-105 transition-transform cursor-pointer"
                aria-label="Open mobile menu"
              >
                {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </nav>
        </header>

        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-40 lg:hidden bg-black/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, y: -16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="fixed top-16 sm:top-20 inset-x-3 sm:inset-x-8 z-40 lg:hidden bg-[var(--bg-color)]/95 backdrop-blur-2xl rounded-2xl border border-[var(--card-border)] shadow-2xl p-5 flex flex-col gap-3"
              >
                <div className="flex flex-col divide-y divide-[var(--card-border)]">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-bold text-[var(--text-color)] py-2.5 hover:text-[#0369a1] dark:hover:text-[#00f2fe] transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-[var(--card-border)]">
                  <a 
                    href="#contact" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 bg-[var(--text-color)] text-[var(--bg-color)] rounded-full font-bold text-center text-xs"
                  >
                    {t.nav.talk}
                  </a>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <section className="relative w-full min-h-[100dvh] flex flex-col md:flex-row items-center justify-center px-4 sm:px-6 md:px-12 pt-28 sm:pt-32 pb-16">
          <div className="w-full md:w-1/2 z-10 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              key={lang}
            >
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6 leading-[1.08] sm:leading-tight tracking-tight">
                {t.hero.title.split(' ').map((word, i, arr) => 
                  i === arr.length - 2 ? <span key={i} className="gradient-text">{word} </span> : <span key={i}>{word} </span>
                )}
              </h1>
              
              <p className="text-sm sm:text-base md:text-xl text-muted max-w-lg mb-6 sm:mb-8 leading-relaxed">
                {t.hero.subtitle}
              </p>

              {/* Action Buttons & Social Links */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 mb-8 sm:mb-10">
                <a 
                  href="#experience" 
                  className="liquid-pill group relative overflow-hidden px-5 sm:px-6 py-2.5 sm:py-3 bg-[var(--text-color)] text-[var(--bg-color)] rounded-full font-bold text-xs sm:text-sm flex items-center gap-3 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <LiquidWaterCanvas />
                  <span className="relative z-10">{t.hero.cta}</span>
                  <span className="relative z-10 p-1 rounded-full bg-[var(--bg-color)]/20 text-[var(--bg-color)] group-hover:translate-x-1 group-hover:bg-[var(--bg-color)]/30 transition-all duration-300 flex items-center justify-center">
                    <ChevronRight size={15} />
                  </span>
                </a>

                <div className="flex items-center gap-2">
                  <a 
                    href="https://linkedin.com/in/matheusmgd" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2.5 sm:p-3 rounded-full glass-card liquid-pill hover:border-[#0369a1] dark:hover:border-[#00f2fe] hover:scale-110 transition-all text-muted hover:text-[var(--text-color)] cursor-pointer"
                    aria-label="LinkedIn Profile"
                    title="LinkedIn: matheusmgd"
                  >
                    <LinkedinIcon size={18} />
                  </a>
                  <a 
                    href="https://github.com/mathmach" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2.5 sm:p-3 rounded-full glass-card liquid-pill hover:border-[#0369a1] dark:hover:border-[#00f2fe] hover:scale-110 transition-all text-muted hover:text-[var(--text-color)] cursor-pointer"
                    aria-label="GitHub Profile"
                    title="GitHub: mathmach"
                  >
                    <GithubIcon size={18} />
                  </a>
                  <a 
                    href="mailto:matheusmgduarte@outlook.com"
                    className="p-2.5 sm:p-3 rounded-full glass-card liquid-pill hover:border-[#0369a1] dark:hover:border-[#00f2fe] hover:scale-110 transition-all text-muted hover:text-[var(--text-color)] cursor-pointer"
                    title="Direct Email"
                  >
                    <Mail size={18} />
                  </a>
                </div>
              </div>

              {/* Recruiter Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-6 border-t border-[var(--card-border)]">
                {t.hero.stats.map((st: HeroStat, idx: number) => (
                  <LiquidCard key={idx} className="p-2.5 sm:p-3 rounded-2xl">
                    <div className="text-sm sm:text-base font-bold tracking-tight text-[#0369a1] dark:text-[#00f2fe]">{st.value}</div>
                    <div className="text-[10px] sm:text-[11px] text-muted font-medium mt-0.5 leading-snug">{st.label}</div>
                  </LiquidCard>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="w-full md:w-1/2 h-[320px] sm:h-[420px] md:h-[550px] lg:h-[650px] relative mt-6 md:mt-0 z-0 flex items-center justify-center">
            <HeroExperience theme={theme} />
            
            <div className="absolute bottom-2 sm:bottom-4 px-3 py-1 rounded-full glass-card text-[10px] sm:text-xs font-mono text-muted flex items-center gap-1.5 pointer-events-none opacity-80 backdrop-blur-md">
              <RotateCcw size={12} className="animate-spin text-[#0369a1] dark:text-[#00f2fe]" style={{ animationDuration: '6s' }} />
              <span>{t.hero.dragHint}</span>
            </div>
          </div>
        </section>

        <section id="methodology" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-[var(--card-border)]">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] text-xs font-mono uppercase tracking-[0.2em] mb-4 text-[#0369a1] dark:text-[#00f2fe]">
                <Activity size={14} />
                Quality Assurance & Systems Engineering
              </div>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">{t.methodology.title}</h2>
              <p className="text-sm sm:text-base md:text-lg text-muted leading-relaxed">{t.methodology.subtitle}</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {t.methodology.pillars.map((pillar: MethodologyPillar, i: number) => (
              <FadeIn key={i} delay={i * 0.05} className="h-full">
                <LiquidCard className="p-6 sm:p-8 h-full">
                  <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <div className="p-2.5 sm:p-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] group-hover:scale-110 transition-transform">
                        {getPillarIcon(i)}
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] text-muted">
                        {pillar.tag}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 group-hover:text-[#0369a1] dark:group-hover:text-[#00f2fe] transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-muted leading-relaxed text-xs sm:text-sm mb-6">
                      {pillar.desc}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[var(--card-border)] flex items-center justify-between text-xs font-mono text-muted">
                    <span className="text-[10px] sm:text-[11px] opacity-80 truncate">{pillar.ref}</span>
                    <CheckCircle2 size={15} className="text-[#0369a1] dark:text-[#00f2fe] shrink-0 ml-2" />
                  </div>
                </LiquidCard>
              </FadeIn>
            ))}
          </div>
        </section>

        <section id="experience" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto border-t border-[var(--card-border)]">
          <FadeIn>
            <h2 className="text-3xl sm:text-5xl font-bold mb-12 sm:mb-16 text-center">{t.exp.title}</h2>
          </FadeIn>
          
          <div className="relative border-l-2 border-[var(--card-border)] ml-3 sm:ml-4 md:ml-0 md:border-l-0 space-y-8 sm:space-y-10 pl-4 sm:pl-6 md:pl-0">
            {t.exp.jobs.map((exp: Job, i: number) => (
              <FadeIn key={i} delay={0.03} className="relative md:flex items-start justify-between group">
                <div className="md:hidden absolute -left-[23px] sm:-left-[31px] top-3.5 w-2.5 sm:w-3 h-2.5 sm:h-3 bg-[#0369a1] dark:bg-[#00f2fe] rounded-full border-4 border-[var(--bg-color)]" />
                
                <div className="md:w-1/3 pt-1 mb-2 md:mb-0 md:pr-6">
                  <span className="inline-block px-3.5 py-1 bg-[#0369a1]/10 dark:bg-[var(--card-bg)] rounded-full border border-[#0369a1]/25 dark:border-[var(--card-border)] text-xs sm:text-sm font-bold whitespace-nowrap text-[#0369a1] dark:text-[#00f2fe]">
                    {exp.year}
                  </span>
                </div>
                
                <div className="md:w-2/3">
                  <LiquidCard className="p-5 sm:p-7 md:p-8">
                    <h3 className="text-xl sm:text-2xl font-bold mb-1 group-hover:text-[#0369a1] dark:group-hover:text-[#00f2fe] transition-colors">{exp.role}</h3>
                    <h4 className="text-base sm:text-lg font-medium text-[var(--text-color)] opacity-80 mb-3 sm:mb-4">{exp.corp}</h4>
                    <ul className="space-y-2">
                      {exp.points.map((pt, pIdx) => (
                        <li key={pIdx} className="text-muted leading-relaxed flex items-start gap-2 text-xs sm:text-sm">
                          <span className="text-[#0369a1] dark:text-[#00f2fe] mt-0.5 shrink-0">▸</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </LiquidCard>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Categorized Tech Stack */}
        <section id="tech" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-[var(--card-border)]">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold mb-3 sm:mb-4">{t.tech.title}</h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed">{t.tech.subtitle}</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {t.tech.categories.map((cat: TechCategory, cIdx: number) => (
              <FadeIn key={cIdx} delay={cIdx * 0.05} className="h-full">
                <LiquidCard className="p-5 sm:p-6 h-full">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-[#0369a1] dark:text-[#00f2fe]">
                      {cat.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {cat.items.map((tech, tIdx) => (
                        <span 
                          key={tIdx} 
                          className="liquid-pill px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs font-medium text-[var(--text-color)] hover:border-[#0369a1] dark:hover:border-[#00f2fe] cursor-default"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </LiquidCard>
              </FadeIn>
            ))}
          </div>
        </section>

        <section id="docs" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto border-t border-[var(--card-border)]">
          <FadeIn>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 text-center">{t.docs.title}</h2>
            <p className="text-center text-muted text-xs sm:text-sm max-w-2xl mx-auto mb-8 sm:mb-10">
              {lang === 'pt'
                ? 'Catálogo formal de arquitetura, sistemas distribuídos e fundamentos teóricos com especificações e tempos de leitura estimados.'
                : lang === 'es'
                ? 'Catálogo formal de arquitectura, sistemas distribuidos y fundamentos teóricos con especificaciones y tiempos de lectura estimados.'
                : 'Formal catalog of software architecture, distributed systems, and theoretical foundations with specifications and estimated reading times.'}
            </p>
          </FadeIn>

          <FadeIn delay={0.1} className="mb-6 sm:mb-8">
            <LiquidCard className="p-4 sm:p-6 rounded-2xl border border-[var(--card-border)]">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#0369a1]/10 dark:bg-[#00f2fe]/10 text-[#0369a1] dark:text-[#00f2fe] shrink-0">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--text-color)]">{t.docs.c1.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[11px] sm:text-xs text-muted">
                    {t.docs.c1.items.map((item, idx) => (
                      <span key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-[#0369a1] dark:text-[#00f2fe] shrink-0" />
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </LiquidCard>
          </FadeIn>

          <FadeIn delay={0.2}>
            <DocsReader lang={lang} />
          </FadeIn>
        </section>

        {/* Contact / Footer */}
        <section id="contact" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 text-center border-t border-[var(--card-border)]">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">{t.contact.title}</h2>
            <p className="text-muted mb-8 sm:mb-10 max-w-lg mx-auto text-xs sm:text-base leading-relaxed">
              {t.contact.desc}
            </p>
            
            <div className="flex justify-center max-w-md mx-auto sm:max-w-none">
              <a 
                href="mailto:matheusmgduarte@outlook.com" 
                className="liquid-pill group relative overflow-hidden w-full sm:w-auto px-7 py-3.5 bg-[var(--text-color)] text-[var(--bg-color)] rounded-full font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all text-sm cursor-pointer"
              >
                <LiquidWaterCanvas />
                <span className="relative z-10 p-1.5 rounded-full bg-[var(--bg-color)]/20 text-[var(--bg-color)] group-hover:scale-110 group-hover:bg-[var(--bg-color)]/30 transition-all duration-300 flex items-center justify-center">
                  <Mail size={16} />
                </span>
                <span className="relative z-10">{t.contact.btn}</span>
              </a>
            </div>

            <div className="mt-12 sm:mt-16 flex justify-center gap-3 sm:gap-4">
              <a 
                href="https://linkedin.com/in/matheusmgd" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 rounded-full glass-card liquid-pill hover:border-[#0369a1] dark:hover:border-[#00f2fe] hover:scale-110 transition-all text-muted hover:text-[var(--text-color)] cursor-pointer"
                title="LinkedIn Profile"
              >
                <LinkedinIcon size={20} />
              </a>
              <a 
                href="https://github.com/mathmach" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 rounded-full glass-card liquid-pill hover:border-[#0369a1] dark:hover:border-[#00f2fe] hover:scale-110 transition-all text-muted hover:text-[var(--text-color)] cursor-pointer"
                title="GitHub Profile"
              >
                <GithubIcon size={20} />
              </a>
            </div>

            <div className="mt-8 sm:mt-10 text-[11px] sm:text-xs font-mono text-muted space-y-1">
              <p>© 2026 Matheus Machado Guerzoni Duarte. {t.contact.rights}</p>
            </div>
          </FadeIn>
        </section>

      </div>
    </AppContext.Provider>
  );
}
