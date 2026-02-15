import { useState, useEffect } from 'react';

/**
 * Custom hook that tracks whether a CSS media query matches.
 *
 * Listens for changes to the media query and re-renders the component
 * whenever the match state changes.
 *
 * @param query - A CSS media query string (e.g., `'(max-width: 768px)'`).
 * @returns `true` if the media query currently matches, `false` otherwise.
 *
 * @example
 * const isNarrow = useMediaQuery('(max-width: 600px)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

/**
 * Convenience hook that returns `true` on mobile viewports (width ≤ 768px).
 *
 * @returns `true` if the viewport is mobile-sized.
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/**
 * Convenience hook that returns `true` on tablet viewports (769px – 1024px).
 *
 * @returns `true` if the viewport is tablet-sized.
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

/**
 * Convenience hook that returns `true` on desktop viewports (width ≥ 1025px).
 *
 * @returns `true` if the viewport is desktop-sized.
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}
