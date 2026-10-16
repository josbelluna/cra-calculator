"use client";

import { useState } from "react";
import {
  HIGH_WAGE_NOCS,
  JOB_OFFER_POINTS,
  NOC_LIST_SOURCE,
  WORK_EXPERIENCE_BONUS,
  findNoc,
  searchNocs,
  type WageTier,
} from "@/lib/highWageNocs";
import { Card, buttonClass, inputClass } from "./fields";
import { TierBadge } from "./TierBadge";

const TIERS: WageTier[] = ["2x", "1.5x", "1.3x"];

export function NocLookup({
  onUseAsWork,
  onUseAsOffer,
}: {
  onUseAsWork: (code: string) => void;
  onUseAsOffer: (code: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<WageTier | null>(null);

  const q = query.trim();
  const results = q ? searchNocs(q, 40) : tier ? HIGH_WAGE_NOCS.filter((n) => n.tier === tier) : [];
  const unknownCode = /^\d{5}$/.test(q) && !findNoc(q);

  return (
    <Card
      title="NOC high-wage lookup"
      aside={
        <a href={NOC_LIST_SOURCE} target="_blank" rel="noreferrer" className="text-[11px] text-zinc-500 underline">
          IRCC list
        </a>
      }
    >
      <input
        className={inputClass}
        placeholder="Search a job title or NOC code"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
        {TIERS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setQuery("");
              setTier(tier === t ? null : t);
            }}
            className={`rounded-full border px-2 py-0.5 ${
              tier === t && !q
                ? "border-red-600 bg-red-600 text-white"
                : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            {t} median: +{WORK_EXPERIENCE_BONUS[t]} work / {JOB_OFFER_POINTS[t]} offer
          </button>
        ))}
      </div>

      {unknownCode && (
        <p className="mt-2 rounded-md bg-zinc-100 p-2 text-xs dark:bg-zinc-900">
          NOC {q} is not a high-wage occupation. It earns no high-wage work bonus, and a job offer in it earns 0
          points. Regular Canadian work experience points still apply if it is TEER 0-3.
        </p>
      )}
      {q && !unknownCode && results.length === 0 && (
        <p className="mt-2 text-xs text-zinc-500">
          No high-wage occupation matches. If your job isn&apos;t listed, it earns no high-wage points.
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-2 max-h-80 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-900">
          {results.map((n) => (
            <li key={n.code} className="flex items-center gap-2 py-1.5">
              <span className="font-mono text-xs text-zinc-500">{n.code}</span>
              <TierBadge tier={n.tier} />
              <span className="min-w-0 flex-1 truncate text-xs" title={n.title}>
                {n.title}
              </span>
              <button
                type="button"
                className={`${buttonClass} h-6 px-1.5 text-[11px]`}
                title={`Add as Canadian work experience (+${WORK_EXPERIENCE_BONUS[n.tier]} bonus with 12+ months)`}
                onClick={() => onUseAsWork(n.code)}
              >
                +Work
              </button>
              <button
                type="button"
                className={`${buttonClass} h-6 px-1.5 text-[11px]`}
                title={`Set as job offer (${JOB_OFFER_POINTS[n.tier]} points)`}
                onClick={() => onUseAsOffer(n.code)}
              >
                Offer
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
