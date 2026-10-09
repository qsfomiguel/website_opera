import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Underline-sweep hover pattern adapted from Skiper UI's Skiper 40 (skiper-ui.com).
export function AnimatedLink({
  href,
  children,
  className,
  showArrow = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  showArrow?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center",
        "before:pointer-events-none before:absolute before:-bottom-1 before:left-0 before:h-px before:w-full before:origin-right before:scale-x-0 before:bg-current before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)] before:content-['']",
        "hover:before:origin-left hover:before:scale-x-100",
        className,
      )}
    >
      {children}
      {showArrow ? (
        <svg
          className="ml-1.5 size-[0.6em] -translate-y-0.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </Link>
  );
}
