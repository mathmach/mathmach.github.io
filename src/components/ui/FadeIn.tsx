import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  fade?: boolean;
}

export function FadeIn({ children, delay = 0, className = '', fade = true }: FadeInProps) {
  return (
    <motion.div
      initial={fade ? { opacity: 0, y: 22 } : { y: 24, scale: 0.98 }}
      whileInView={fade ? { opacity: 1, y: 0 } : { y: 0, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px 50px 0px' }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
