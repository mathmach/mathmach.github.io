import type { Lang, Job } from '../../i18n';
import { translations } from '../../i18n';
import { LiquidCard } from '../../components/ui/LiquidCard';
import { LiquidPill } from '../../components/ui/LiquidPill';
import { FadeIn } from '../../components/ui/FadeIn';

interface ExperienceSectionProps {
  lang: Lang;
}

export function ExperienceSection({ lang }: ExperienceSectionProps) {
  const t = translations[lang];

  return (
    <section id="experience" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto border-t border-[var(--card-border)]">
      <FadeIn>
        <h2 className="text-3xl sm:text-5xl font-bold mb-12 sm:mb-16 text-center">{t.exp.title}</h2>
      </FadeIn>

      <div className="relative border-l-2 border-[var(--card-border)] ml-3 sm:ml-4 md:ml-0 md:border-l-0 space-y-8 sm:space-y-10 pl-4 sm:pl-6 md:pl-0">
        {t.exp.jobs.map((exp: Job, i: number) => (
          <FadeIn key={i} delay={0.03} fade={false} className="relative md:flex items-start justify-between group">
            <div className="md:hidden absolute -left-[23px] sm:-left-[31px] top-3.5 w-3 h-3 liquid-pill-accent rounded-full border-2 border-[var(--bg-color)] shadow-sm" />

            <div className="md:w-1/3 pt-1 mb-2 md:mb-0 md:pr-6">
              <LiquidPill variant="accent" size="md" className="font-bold whitespace-nowrap">
                {exp.year}
              </LiquidPill>
            </div>

            <div className="md:w-2/3">
              <LiquidCard variant="interactive" padding="lg">
                <h3 className="text-xl sm:text-2xl font-bold mb-1 group-hover:text-[var(--accent)] transition-colors">{exp.role}</h3>
                <h4 className="text-base sm:text-lg font-medium text-secondary mb-3 sm:mb-4">{exp.corp}</h4>
                <ul className="space-y-2">
                  {exp.points.map((pt, pIdx) => (
                    <li key={pIdx} className="text-muted leading-relaxed flex items-start gap-2 text-xs sm:text-sm">
                      <span className="text-[var(--accent)] mt-0.5 shrink-0">▸</span>
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
  );
}
