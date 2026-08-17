"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function Header({ title, breadcrumbs, actions }: HeaderProps) {
  const hasCrumbs = !!breadcrumbs && breadcrumbs.length > 0;
  // The last breadcrumb already renders as the page title, so showing a
  // separate title alongside it would just repeat the same label twice.
  const showTitle = !!title && !hasCrumbs;

  return (
    <header className="sticky top-12 z-30 flex h-12 items-center border-b border-white/[0.06] bg-[#080c16]/95 backdrop-blur-sm px-4 md:px-6">
      {/* Left */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {showTitle && (
          <span className="text-sm font-semibold text-white shrink-0">{title}</span>
        )}
        {hasCrumbs && (
          <nav className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={13} className="text-[#3a4a6a]" />}
                {crumb.href && i < breadcrumbs.length - 1 ? (
                  <Link href={crumb.href} className="text-xs text-[#4a5a7a] hover:text-slate-300 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "text-xs",
                      i === breadcrumbs.length - 1
                        ? "text-white font-medium border-b border-white pb-0.5"
                        : "text-[#4a5a7a]"
                    )}
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Right: page-level actions */}
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}
