import { AnimatePresence, motion } from 'framer-motion';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { LiquidButton } from '../../components/ui/LiquidButton';
import { buildNavLinks } from '../../domain/navigation';
import type { Lang } from '../../i18n';
import { translations } from '../../i18n';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  lang: Lang;
}

export function MobileMenu({ open, onClose, lang }: MobileMenuProps) {
  const t = translations[lang];

  const navLinks = buildNavLinks(t.nav);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 lg:hidden bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 sm:top-20 inset-x-3 sm:inset-x-8 z-40 lg:hidden rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
          >
            <GlassSurface
              borderRadius={20}
              blur={28}
              saturation={1.9}
              backgroundOpacity={0.55}
              shadow="0 24px 60px -12px rgba(0, 0, 0, 0.6)"
              className="p-5 flex flex-col gap-3 w-full"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="text-base sm:text-lg font-bold text-[var(--text-color)] px-3 py-2.5 rounded-xl hover:bg-[var(--glass-tint-hover)] hover:text-[var(--accent)] transition-all"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-[var(--card-border)]">
                <LiquidButton
                  variant="prominentGlass"
                  size="lg"
                  href="#contact"
                  onClick={onClose}
                  className="w-full justify-center text-center"
                >
                  {t.nav.talk}
                </LiquidButton>
              </div>
            </GlassSurface>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
