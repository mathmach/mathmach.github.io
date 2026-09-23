import { Mail } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../../components/Icons';
import { FadeIn } from '../../components/ui/FadeIn';
import { LiquidButton } from '../../components/ui/LiquidButton';
import type { Lang } from '../../i18n';
import { translations } from '../../i18n';

interface ContactSectionProps {
  lang: Lang;
}

export function ContactSection({ lang }: ContactSectionProps) {
  const t = translations[lang];
  const currentYear = new Date().getFullYear();

  return (
    <section
      id="contact"
      className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 text-center border-t border-[var(--card-border)]"
    >
      <FadeIn>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">{t.contact.title}</h2>
        <p className="text-muted mb-8 sm:mb-10 max-w-lg mx-auto text-xs sm:text-base leading-relaxed">
          {t.contact.desc}
        </p>

        <div className="flex justify-center max-w-md mx-auto sm:max-w-none">
          <LiquidButton
            variant="prominentGlass"
            size="lg"
            href="mailto:matheusmgduarte@outlook.com"
            className="w-full sm:w-auto"
          >
            <span className="p-1.5 rounded-full liquid-pill-accent group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
              <Mail size={16} />
            </span>
            <span>{t.contact.btn}</span>
          </LiquidButton>
        </div>

        <div className="mt-12 sm:mt-16 flex justify-center gap-3 sm:gap-4">
          <LiquidButton
            variant="icon"
            size="lg"
            href="https://linkedin.com/in/matheusmgd"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn Profile"
            aria-label="LinkedIn Profile"
          >
            <LinkedinIcon size={20} />
          </LiquidButton>
          <LiquidButton
            variant="icon"
            size="lg"
            href="https://github.com/mathmach"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Profile"
            aria-label="GitHub Profile"
          >
            <GithubIcon size={20} />
          </LiquidButton>
        </div>

        <div className="mt-8 sm:mt-10 text-[11px] sm:text-xs font-mono text-muted space-y-1">
          <p>
            &copy; {currentYear} Matheus Machado Guerzoni Duarte. {t.contact.rights}
          </p>
        </div>
      </FadeIn>
    </section>
  );
}
