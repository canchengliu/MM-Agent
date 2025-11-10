import type { ReactNode } from "react";

type LinkProps = {
  href: string | undefined;
  children: ReactNode;
  checkLinkCredibility?: boolean;
};

export const Link = ({ href, children }: LinkProps) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};
