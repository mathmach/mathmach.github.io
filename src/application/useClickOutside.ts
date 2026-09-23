import { type RefObject, useEffect } from 'react';

export function useClickOutside(
  ref: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  onClickOutside: () => void
): void {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const refs = Array.isArray(ref) ? ref : [ref];
      const clickedInside = refs.some((r) => r.current?.contains(event.target as Node));
      if (!clickedInside) {
        onClickOutside();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClickOutside();
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, onClickOutside]);
}
