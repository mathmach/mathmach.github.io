import { Activity, Workflow } from 'lucide-react';
import type { Lang, MethodologyPillar } from '../../i18n';
import { translations } from '../../i18n';
import { PILLAR_ICONS, PILLAR_FALLBACK_ICON, WORKFLOW_ICONS } from '../../domain/constants';
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

      <FadeIn delay={0.08} fade={false} className="mb-12 sm:mb-16">
        <LiquidCard variant="default" padding="lg" className="rounded-3xl border border-[var(--card-border)] overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[var(--card-border)]">
            <div>
              <div className="mb-2">
                <LiquidPill variant="accent" size="sm" className="font-mono uppercase tracking-wider text-[11px]">
                  <Workflow size={13} />
                  <span>{t.methodology.workflow.badge}</span>
                </LiquidPill>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-color)]">
                {t.methodology.workflow.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-muted max-w-xl leading-relaxed">
              {t.methodology.workflow.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 relative">
            {t.methodology.workflow.stages.map((stage, sIdx) => {
              const Icon = WORKFLOW_ICONS[sIdx] ?? PILLAR_FALLBACK_ICON;
              const isLast = sIdx === t.methodology.workflow.stages.length - 1;
              return (
                <div key={sIdx} className="relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-[var(--glass-tint)] border border-[var(--card-border)] hover:border-[var(--accent)] transition-all group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-[var(--accent)] tracking-wider">
                        {stage.step}
                      </span>
                      <div className="p-2 rounded-xl liquid-pill-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon size={16} />
                      </div>
                    </div>

                    <h4 className="text-sm font-bold mb-2 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                      {stage.title}
                    </h4>
                    <p className="text-muted text-[11px] leading-relaxed mb-4">
                      {stage.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--card-border)]">
                    <span className="font-mono text-[10px] text-muted block truncate">
                      {stage.standard}
                    </span>
                  </div>

                  {!isLast && (
                    <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-[var(--card-border)] items-center justify-center text-[var(--accent)] text-[10px]">
                      ▸
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </LiquidCard>
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
                <div className="pt-4 border-t border-[var(--card-border)]">
                  <span className="font-mono text-xs text-muted block truncate">
                    {pillar.ref}
                  </span>
                </div>
              </LiquidCard>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
