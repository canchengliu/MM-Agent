import { useEffect, useLayoutEffect, useMemo, useState } from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  const mediaQueryList = useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return null;
    }

    return window.matchMedia(query);
  }, [query]);

  useIsomorphicLayoutEffect(() => {
    if (!mediaQueryList) {
      return;
    }

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    setMatches(mediaQueryList.matches);

    try {
      mediaQueryList.addEventListener("change", listener);
    } catch {
      mediaQueryList.addListener(listener);
    }

    return () => {
      try {
        mediaQueryList.removeEventListener("change", listener);
      } catch {
        mediaQueryList.removeListener(listener);
      }
    };
  }, [mediaQueryList]);

  return matches;
}
