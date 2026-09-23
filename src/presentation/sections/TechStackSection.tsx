import { FadeIn } from '../../components/ui/FadeIn';
import { LiquidCard } from '../../components/ui/LiquidCard';
import { LiquidPill } from '../../components/ui/LiquidPill';
import type { Lang, TechCategory } from '../../i18n';
import { translations } from '../../i18n';

interface TechStackSectionProps {
  lang: Lang;
}

export function TechStackSection({ lang }: TechStackSectionProps) {
  const t = translations[lang];

  return (
    <section
      id="tech"
      className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-[var(--card-border)]"
    >
      <FadeIn>
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-3 sm:mb-4">{t.tech.title}</h2>
          <p className="text-sm sm:text-base text-muted leading-relaxed">{t.tech.subtitle}</p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {t.tech.categories.map((cat: TechCategory, cIdx: number) => (
          <FadeIn key={cIdx} delay={cIdx * 0.05} fade={false} className="h-full">
            <LiquidCard variant="interactive" padding="md" className="h-full">
              <div>
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-[var(--accent)]">{cat.name}</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {cat.items.map((tech, tIdx) => (
                    <LiquidPill key={tIdx} variant="neutral" size="sm" interactive={true}>
                      {tech}
                    </LiquidPill>
                  ))}
                </div>
              </div>
            </LiquidCard>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
