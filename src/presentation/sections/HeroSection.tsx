import { motion } from 'framer-motion';
import { Mail, ChevronRight } from 'lucide-react';
import type { Lang, HeroStat } from '../../i18n';
import { translations } from '../../i18n';
import { HeroExperience } from '../hero/HeroExperience';
import { LiquidButton } from '../../components/ui/LiquidButton';
import { LiquidCard } from '../../components/ui/LiquidCard';
import { GithubIcon, LinkedinIcon } from '../../components/Icons';

interface HeroSectionProps {
  lang: Lang;
  theme: 'dark' | 'light';
}

export function HeroSection({ lang, theme }: HeroSectionProps) {
  const t = translations[lang];

  return (
    <section className="relative w-full min-h-[100dvh] flex flex-col md:flex-row items-center justify-center px-4 sm:px-6 md:px-12 pt-28 sm:pt-32 pb-16">
      <div className="w-full md:w-1/2 z-10 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          key={lang}
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6 leading-[1.08] sm:leading-tight tracking-tight">
            {t.hero.title.split(' ').map((word: string, i: number, arr: string[]) =>
              i === arr.length - 2 ? <span key={i} className="gradient-text">{word} </span> : <span key={i}>{word} </span>
            )}
          </h1>

          <p className="text-sm sm:text-base md:text-xl text-muted max-w-lg mb-6 sm:mb-8 leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 mb-8 sm:mb-10">
            <LiquidButton
              variant="prominentGlass"
              size="md"
              href="#experience"
              className="gap-3"
            >
              <span>{t.hero.cta}</span>
              <span className="p-1 rounded-full liquid-pill-accent group-hover:translate-x-1 transition-all duration-300 flex items-center justify-center">
                <ChevronRight size={15} />
              </span>
            </LiquidButton>

            <div className="flex items-center gap-2">
              <LiquidButton
                variant="icon"
                size="md"
                href="https://linkedin.com/in/matheusmgd"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                title="LinkedIn: matheusmgd"
              >
                <LinkedinIcon size={18} />
              </LiquidButton>
              <LiquidButton
                variant="icon"
                size="md"
                href="https://github.com/mathmach"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                title="GitHub: mathmach"
              >
                <GithubIcon size={18} />
              </LiquidButton>
              <LiquidButton
                variant="icon"
                size="md"
                href="mailto:matheusmgduarte@outlook.com"
                title="Direct Email"
              >
                <Mail size={18} />
              </LiquidButton>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-6 border-t border-[var(--card-border)]">
            {t.hero.stats.map((st: HeroStat, idx: number) => (
              <LiquidCard key={idx} variant="stat" padding="sm" className="rounded-2xl">
                <div className="text-sm sm:text-base font-bold tracking-tight text-[var(--accent)]">{st.value}</div>
                <div className="text-[10px] sm:text-[11px] text-muted font-medium mt-0.5 leading-snug">{st.label}</div>
              </LiquidCard>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="w-full md:w-1/2 h-[350px] sm:h-[450px] md:h-[580px] lg:h-[680px] relative mt-6 md:mt-0 z-0 flex items-center justify-center">
        <HeroExperience theme={theme} />
      </div>
    </section>
  );
}
