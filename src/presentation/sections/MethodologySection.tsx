import { Activity, CheckCircle2 } from 'lucide-react';
import type { Lang, MethodologyPillar } from '../../i18n';
import { translations } from '../../i18n';
import { PILLAR_ICONS, PILLAR_FALLBACK_ICON } from '../../domain/constants';
import { LiquidCard } from '../../components/ui/LiquidCard';
import { LiquidPill } from '../../components/ui/LiquidPill';
import { FadeIn } from '../../components/ui/FadeIn';

interface MethodologySectionProps {
  lang: Lang;
}

export function MethodologySection({ lang }: MethodologySectionProps) {
  const t = translations[lang];

  return (
    <section id="methodology" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-[var(--card-border)]">
      <FadeIn>
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="mb-4">
            <LiquidPill variant="accent" size="md" className="font-mono uppercase tracking-[0.2em]">
              <Activity size={14} />
              <span>Quality Assurance & Systems Engineering</span>
            </LiquidPill>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">{t.methodology.title}</h2>
          <p className="text-sm sm:text-base md:text-lg text-muted leading-relaxed">{t.methodology.subtitle}</p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {t.methodology.pillars.map((pillar: MethodologyPillar, i: number) => {
          const Icon = PILLAR_ICONS[i] ?? PILLAR_FALLBACK_ICON;
          return (
            <FadeIn key={i} delay={i * 0.05} fade={false} className="h-full">
              <LiquidCard variant="interactive" padding="lg" className="h-full">
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="p-2.5 sm:p-3 rounded-2xl liquid-pill-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon size={24} />
                    </div>
                    <LiquidPill variant="neutral" size="sm" className="font-mono uppercase tracking-wider">
                      {pillar.tag}
                    </LiquidPill>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 group-hover:text-[var(--accent)] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-muted leading-relaxed text-xs sm:text-sm mb-6">
                    {pillar.desc}
                  </p>
                </div>
                <div className="pt-4 border-t border-[var(--card-border)] flex items-center justify-between gap-2 text-xs font-mono text-muted">
                  <LiquidPill variant="outline" size="sm" className="!justify-start text-left leading-normal py-1 flex-1 min-w-0">
                    {pillar.ref}
                  </LiquidPill>
                  <CheckCircle2 size={15} className="text-[var(--accent)] shrink-0" />
                </div>
              </LiquidCard>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
