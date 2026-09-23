
interface NavLink {
  href: string;
  label: string;
}

export function buildNavLinks(nav: { methodology: string; exp: string; tech: string; docs: string }): NavLink[] {
  return [
    { href: '#methodology', label: nav.methodology },
    { href: '#experience', label: nav.exp },
    { href: '#tech', label: nav.tech },
    { href: '#docs', label: nav.docs },
  ];
}
