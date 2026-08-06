"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Static class strings so Tailwind's JIT keeps them — a template-literal
// `line-clamp-${n}` would be purged.
const CLAMP: Record<number, string> = {
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
};

/**
 * Clamps long text to `lines` rows with a See more / See less toggle. The
 * toggle appears only when the text genuinely overflows — measured against the
 * clamped element, not guessed from length.
 */
export function ExpandableText({
  text, lines = 3, className,
}: {
  text: string;
  lines?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  // `expanded` is deliberately excluded — re-measuring once the clamp is lifted
  // would read no overflow and hide the "See less" toggle.
  useEffect(() => {
    const el = ref.current;
    if (!el) { setOverflows(false); return; }
    setOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [text, lines]);

  return (
    <div>
      <p
        ref={ref}
        className={cn("whitespace-pre-wrap break-words", !expanded && (CLAMP[lines] ?? CLAMP[3]), className)}
      >
        {text}
      </p>
      {overflows && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}
