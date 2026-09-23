import type { LucideIcon } from 'lucide-react';
import { Layers, ShieldCheck, Activity, GitBranch, Cpu, Radar, Sparkles, Search, FlaskConical } from 'lucide-react';

export const PILLAR_ICONS: LucideIcon[] = [
  Layers,
  ShieldCheck,
  Activity,
  GitBranch,
  Cpu,
  Radar,
];

export const PILLAR_FALLBACK_ICON: LucideIcon = Sparkles;

export const WORKFLOW_ICONS: LucideIcon[] = [
  Search,
  Layers,
  FlaskConical,
  Cpu,
  ShieldCheck,
  Activity,
];

export const CAREER_START_YEAR = 2016;

export function getYearsOfExperience(currentYear: number = new Date().getFullYear()): number {
  return Math.max(0, currentYear - CAREER_START_YEAR);
}

export const YEARS_OF_EXPERIENCE = getYearsOfExperience();

