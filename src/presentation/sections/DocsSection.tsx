import { BookOpen, CheckCircle2 } from 'lucide-react';
import type { Lang } from '../../i18n';
import { translations } from '../../i18n';
import { DocsReader } from '../docs/DocsReader';
import { LiquidCard } from '../../components/ui/LiquidCard';
import { FadeIn } from '../../components/ui/FadeIn';

interface DocsSectionProps {
  lang: Lang;
}

export function DocsSection({ lang }: DocsSectionProps) {
  const t = translations[lang];

  return (
    <section id="docs" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto border-t border-[var(--card-border)]">
      <FadeIn>
        <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 text-center">{t.docs.title}</h2>
        <p className="text-center text-muted text-xs sm:text-sm max-w-2xl mx-auto mb-8 sm:mb-10">
          {t.docs.subtitle}
        </p>
      </FadeIn>

      <FadeIn delay={0.1} fade={false} className="mb-6 sm:mb-8">
        <LiquidCard variant="default" padding="md" className="rounded-2xl border border-[var(--card-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl liquid-pill-accent shrink-0">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[var(--text-color)]">{t.docs.c1.title}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[11px] sm:text-xs text-muted">
                {t.docs.c1.items.map((item: string, idx: number) => (
                  <span key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-[var(--accent)] shrink-0" />
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
  );
}
