import type { ReactNode } from "react";

export const Link = ({
  href,
  children,
}: {
  href: string | undefined;
  children: ReactNode;
}) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};
