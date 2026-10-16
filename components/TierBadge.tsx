import type { WageTier } from "@/lib/highWageNocs";

const STYLES: Record<WageTier, string> = {
  "2x": "bg-red-600 text-white",
  "1.5x": "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  "1.3x": "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
};

export function TierBadge({ tier }: { tier: WageTier }) {
  return (
    <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${STYLES[tier]}`}>
      {tier}
    </span>
  );
}
