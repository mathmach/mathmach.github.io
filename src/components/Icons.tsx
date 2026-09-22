
export function GithubIcon({ className = "w-5 h-5", size = 20 }: { className?: string, size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export function LinkedinIcon({ className = "w-5 h-5", size = 20 }: { className?: string, size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function BrazilFlag({ className = "w-5 h-3.5", width = 20, height = 14 }: { className?: string, width?: number, height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 overflow-hidden rounded-[2px] shadow-xs border border-black/10 dark:border-white/15 ${className}`}>
      <defs>
        <clipPath id="br-flag-clip">
          <rect width="20" height="14" rx="2" />
        </clipPath>
      </defs>
      <g clipPath="url(#br-flag-clip)">
        <rect width="20" height="14" fill="#009B3A" />
        <polygon points="10,1.8 18.2,7 10,12.2 1.8,7" fill="#FEDF00" />
        <circle cx="10" cy="7" r="3.2" fill="#002776" />
        <path d="M 6.9 7.3 Q 10 5.8 13.1 7.8" stroke="#FFFFFF" strokeWidth="0.75" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function USAFlag({ className = "w-5 h-3.5", width = 20, height = 14 }: { className?: string, width?: number, height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 overflow-hidden rounded-[2px] shadow-xs border border-black/10 dark:border-white/15 ${className}`}>
      <defs>
        <clipPath id="us-flag-clip">
          <rect width="20" height="14" rx="2" />
        </clipPath>
      </defs>
      <g clipPath="url(#us-flag-clip)">
        <rect width="20" height="14" fill="#FFFFFF" />
        <rect y="0" width="20" height="1.077" fill="#B22234" />
        <rect y="2.154" width="20" height="1.077" fill="#B22234" />
        <rect y="4.308" width="20" height="1.077" fill="#B22234" />
        <rect y="6.462" width="20" height="1.077" fill="#B22234" />
        <rect y="8.615" width="20" height="1.077" fill="#B22234" />
        <rect y="10.769" width="20" height="1.077" fill="#B22234" />
        <rect y="12.923" width="20" height="1.077" fill="#B22234" />
        <rect width="9" height="7.538" fill="#3C3B6E" />
        <circle cx="2" cy="1.6" r="0.55" fill="#FFFFFF" />
        <circle cx="4.5" cy="1.6" r="0.55" fill="#FFFFFF" />
        <circle cx="7" cy="1.6" r="0.55" fill="#FFFFFF" />
        <circle cx="3.25" cy="2.9" r="0.55" fill="#FFFFFF" />
        <circle cx="5.75" cy="2.9" r="0.55" fill="#FFFFFF" />
        <circle cx="2" cy="4.2" r="0.55" fill="#FFFFFF" />
        <circle cx="4.5" cy="4.2" r="0.55" fill="#FFFFFF" />
        <circle cx="7" cy="4.2" r="0.55" fill="#FFFFFF" />
        <circle cx="3.25" cy="5.5" r="0.55" fill="#FFFFFF" />
        <circle cx="5.75" cy="5.5" r="0.55" fill="#FFFFFF" />
        <circle cx="2" cy="6.6" r="0.55" fill="#FFFFFF" />
        <circle cx="4.5" cy="6.6" r="0.55" fill="#FFFFFF" />
        <circle cx="7" cy="6.6" r="0.55" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

export function SpainFlag({ className = "w-5 h-3.5", width = 20, height = 14 }: { className?: string, width?: number, height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 overflow-hidden rounded-[2px] shadow-xs border border-black/10 dark:border-white/15 ${className}`}>
      <defs>
        <clipPath id="es-flag-clip">
          <rect width="20" height="14" rx="2" />
        </clipPath>
      </defs>
      <g clipPath="url(#es-flag-clip)">
        <rect y="0" width="20" height="3.5" fill="#AA151B" />
        <rect y="3.5" width="20" height="7" fill="#F1BF00" />
        <rect y="10.5" width="20" height="3.5" fill="#AA151B" />
        <circle cx="5.5" cy="7" r="1.6" fill="#AA151B" />
        <circle cx="5.5" cy="7" r="0.8" fill="#F1BF00" />
      </g>
    </svg>
  );
}
