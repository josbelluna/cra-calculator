"use client";

import { useState } from "react";
import { calculateCrs } from "@/lib/crs";
import {
  createProfile,
  deleteProfile,
  discardDraft,
  duplicateProfile,
  renameProfile,
  saveDraft,
  setActive,
  workingProfile,
  type StoreState,
} from "@/lib/storage";
import { Card, buttonClass, inputClass } from "./fields";

export function ProfileManager({ state }: { state: StoreState }) {
  const [renaming, setRenaming] = useState<string | null>(null);
  const active = state.profiles.find((p) => p.id === state.activeId) ?? state.profiles[0];
  const dirty = Boolean(state.drafts[active.id]);

  const startRename = () => setRenaming(active.name);
  const commitRename = () => {
    if (renaming !== null) renameProfile(active.id, renaming);
    setRenaming(null);
  };

  return (
    <Card
      title="Profiles"
      aside={<span className="text-[11px] text-zinc-500">Saved in this browser</span>}
    >
      <ul className="flex flex-col gap-1">
        {state.profiles.map((p) => {
          const isActive = p.id === active.id;
          const edited = Boolean(state.drafts[p.id]);
          const score = calculateCrs(workingProfile(state, p.id)).total;
          return (
            <li key={p.id}>
              {isActive && renaming !== null ? (
                <form
                  className="flex gap-1.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    commitRename();
                  }}
                >
                  <input
                    autoFocus
                    aria-label="Profile name"
                    className={inputClass}
                    value={renaming}
                    maxLength={60}
                    onChange={(e) => setRenaming(e.target.value)}
                    onKeyDown={(e) => e.key === "Escape" && setRenaming(null)}
                  />
                  <button type="submit" className={buttonClass}>
                    OK
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setActive(p.id)}
                  onDoubleClick={isActive ? startRename : undefined}
                  className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                    isActive
                      ? "bg-red-50 ring-1 ring-red-600 dark:bg-red-950/40"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  <span className="truncate">
                    {p.name}
                    {edited && (
                      <span className="ml-1.5 text-[11px] text-amber-600" title="Unsaved changes">
                        ● edited
                      </span>
                    )}
                  </span>
                  <span className="font-semibold tabular-nums">{score}</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <button type="button" className={buttonClass} disabled={!dirty} onClick={() => saveDraft(active.id)}>
          Save
        </button>
        <button type="button" className={buttonClass} disabled={!dirty} onClick={() => discardDraft(active.id)}>
          Discard
        </button>
        <button
          type="button"
          className={buttonClass}
          title="Copy into a new profile, including unsaved changes. The original keeps its saved version."
          onClick={() => {
            duplicateProfile(active.id, `${active.name} (copy)`);
            if (dirty) discardDraft(active.id);
          }}
        >
          Duplicate
        </button>
        <button type="button" className={buttonClass} onClick={startRename}>
          Rename
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => createProfile(`Profile ${state.profiles.length + 1}`)}
        >
          New
        </button>
        <button
          type="button"
          className={`${buttonClass} text-red-600`}
          onClick={() => {
            if (confirm(`Delete "${active.name}"?`)) deleteProfile(active.id);
          }}
        >
          Delete
        </button>
      </div>
    </Card>
  );
}
