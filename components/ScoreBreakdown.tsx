import type { Breakdown } from "@/lib/crs";

export function ScoreBreakdown({ breakdown, delta }: { breakdown: Breakdown; delta: number | null }) {
  const lm = breakdown.labourMarket;
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">CRS score</h2>
        <span className="text-[11px] text-zinc-500">Rules from Nov 3, 2026</span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-4xl font-bold tabular-nums" aria-live="polite">
          {breakdown.total}
        </span>
        {delta !== null && delta !== 0 && (
          <span
            className={`text-sm font-semibold tabular-nums ${delta > 0 ? "text-emerald-600" : "text-red-600"}`}
            title="Change compared with the saved version of this profile"
          >
            {delta > 0 ? "+" : ""}
            {delta} vs saved
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1">
        {breakdown.sections.map((s) => (
          <details key={s.id} className="group rounded-md bg-zinc-50 px-2 py-1 dark:bg-zinc-900">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm">
              <span>
                <span className="mr-1 inline-block text-zinc-400 transition-transform group-open:rotate-90">›</span>
                {s.title}
              </span>
              <span className="tabular-nums">
                <b>{s.points}</b>
                <span className="text-xs text-zinc-400"> / {s.max}</span>
              </span>
            </summary>
            <ul className="mt-1 mb-1 flex flex-col gap-0.5 pl-3 text-xs text-zinc-600 dark:text-zinc-400">
              {s.lines.map((l) => (
                <li key={l.label} className="flex justify-between gap-2">
                  <span>{l.label}</span>
                  <span className="tabular-nums">{l.points}</span>
                </li>
              ))}
              {s.id === "labourMarket" && (
                <li className="mt-1 text-[11px] text-zinc-500">
                  Work experience option: {lm.workBase + lm.workBonus}, job offer option: {lm.jobOffer}. The higher
                  one counts; they are never combined.
                </li>
              )}
            </ul>
          </details>
        ))}
      </div>

      {breakdown.warnings.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 text-xs text-amber-700 dark:text-amber-400">
          {breakdown.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
      {lm.chosen === "jobOffer" && breakdown.sections.some((s) => s.id === "spouse") && (
        <p className="mt-2 text-[11px] text-zinc-500">
          IRCC hasn&apos;t said whether job offer points are lower with a spouse; this uses the same values.
        </p>
      )}
    </section>
  );
}
