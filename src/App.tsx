import { useState } from 'react';
import { AppProvider, useAppContext } from './AppContext';
import { useBodyScrollLock } from './application/useBodyScrollLock';
import { LiquidEffectAnimation } from './components/ui/LiquidEffectAnimation';
import { LIQUID_EFFECT_CONFIG } from './lib/liquid-glass/config';
import { Header } from './presentation/layout/Header';
import { MobileMenu } from './presentation/layout/MobileMenu';
import { ContactSection } from './presentation/sections/ContactSection';
import { DocsSection } from './presentation/sections/DocsSection';
import { ExperienceSection } from './presentation/sections/ExperienceSection';
import { HeroSection } from './presentation/sections/HeroSection';
import { MethodologySection } from './presentation/sections/MethodologySection';
import { TechStackSection } from './presentation/sections/TechStackSection';

function AppShell() {
  const { lang, theme } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useBodyScrollLock(mobileMenuOpen);

  return (
    <div className="w-full min-h-[100dvh] overflow-x-hidden selection:bg-[var(--accent)]/30">
      <LiquidEffectAnimation
        {...LIQUID_EFFECT_CONFIG}
        className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-35"
      />
      <Header onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)} mobileMenuOpen={mobileMenuOpen} />
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} lang={lang} />
      <HeroSection lang={lang} theme={theme} />
      <MethodologySection lang={lang} />
      <ExperienceSection lang={lang} />
      <TechStackSection lang={lang} />
      <DocsSection lang={lang} />
      <ContactSection lang={lang} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
