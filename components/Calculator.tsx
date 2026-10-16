"use client";

import { useSyncExternalStore } from "react";
import { calculateCrs } from "@/lib/crs";
import { editDraft, getState, subscribe, workingProfile } from "@/lib/storage";
import { NocLookup } from "./NocLookup";
import { ProfileForm } from "./ProfileForm";
import { ProfileManager } from "./ProfileManager";
import { ScoreBreakdown } from "./ScoreBreakdown";

const getServerState = () => null;

export function Calculator() {
  const state = useSyncExternalStore(subscribe, getState, getServerState);

  if (!state) {
    return <div className="h-96 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" aria-busy="true" />;
  }

  const active = state.profiles.find((p) => p.id === state.activeId) ?? state.profiles[0];
  const profile = workingProfile(state, active.id);
  const breakdown = calculateCrs(profile);
  const delta = state.drafts[active.id] ? breakdown.total - calculateCrs(active.profile).total : null;
  const onChange = (next: typeof profile) => editDraft(active.id, next);

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_340px]">
      <div className="order-2 flex flex-col gap-3 lg:order-1">
        <ProfileManager state={state} />
        <ProfileForm profile={profile} onChange={onChange} />
      </div>
      <aside className="order-1 flex flex-col gap-3 lg:sticky lg:top-3 lg:order-2 lg:self-start">
        <ScoreBreakdown breakdown={breakdown} delta={delta} />
        <NocLookup
          onUseAsWork={(noc) => onChange({ ...profile, highWageJobs: [...profile.highWageJobs, { noc, months: 12 }] })}
          onUseAsOffer={(noc) => onChange({ ...profile, jobOfferNoc: noc })}
        />
      </aside>
    </div>
  );
}
