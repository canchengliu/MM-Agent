import * as React from "react";

export function useIsMobile(maxWidth = 768) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const query = `(max-width: ${maxWidth - 1}px)`;
    const mql = window.matchMedia(query);
    const onChange = () => {
      setIsMobile(window.innerWidth < maxWidth);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < maxWidth);
    return () => mql.removeEventListener("change", onChange);
  }, [maxWidth]);

  return !!isMobile;
}
