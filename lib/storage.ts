import { defaultProfile, normalizeProfile, type Profile } from "./profile";

export type SavedProfile = {
  id: string;
  name: string;
  updatedAt: number;
  profile: Profile;
};

export type StoreState = {
  profiles: SavedProfile[];
  activeId: string;
  /** Unsaved edits per profile id. Only profiles are stored; scores are always recalculated. */
  drafts: Record<string, Profile>;
};

const PROFILES_KEY = "crs:profiles:v1";
const ACTIVE_KEY = "crs:activeProfileId";
const DRAFTS_KEY = "crs:drafts:v1";

const listeners = new Set<() => void>();
let state: StoreState | null = null;

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function parseProfiles(raw: unknown): SavedProfile[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const { id, name, updatedAt, profile } = item as Record<string, unknown>;
    if (typeof id !== "string" || !id) return [];
    return [
      {
        id,
        name: typeof name === "string" && name.trim() ? name.trim().slice(0, 60) : "Untitled",
        updatedAt: typeof updatedAt === "number" ? updatedAt : Date.now(),
        profile: normalizeProfile(profile),
      },
    ];
  });
}

function load(): StoreState {
  let profiles = parseProfiles(readJson(PROFILES_KEY));
  if (profiles.length === 0) {
    profiles = [{ id: newId(), name: "My profile", updatedAt: Date.now(), profile: defaultProfile() }];
  }
  const ids = new Set(profiles.map((p) => p.id));
  const rawActive = readJson(ACTIVE_KEY);
  const activeId = typeof rawActive === "string" && ids.has(rawActive) ? rawActive : profiles[0].id;

  const drafts: Record<string, Profile> = {};
  const rawDrafts = readJson(DRAFTS_KEY);
  if (rawDrafts && typeof rawDrafts === "object") {
    for (const [id, p] of Object.entries(rawDrafts)) {
      if (ids.has(id)) drafts[id] = normalizeProfile(p);
    }
  }
  return { profiles, activeId, drafts };
}

function persist(next: StoreState) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(next.profiles));
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(next.activeId));
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(next.drafts));
  } catch {
    // Storage full or disabled: keep working in memory.
  }
}

function update(fn: (s: StoreState) => StoreState) {
  state = fn(getState());
  persist(state);
  listeners.forEach((l) => l());
}

export function getState(): StoreState {
  if (!state) {
    state = load();
    persist(state);
  }
  return state;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key && e.key.startsWith("crs:")) {
      state = load();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function omit<T>(record: Record<string, T>, key: string): Record<string, T> {
  const copy = { ...record };
  delete copy[key];
  return copy;
}

export const sameProfile = (a: Profile, b: Profile) => JSON.stringify(a) === JSON.stringify(b);

/** The profile currently being edited: the draft if there is one, otherwise the saved version. */
export const workingProfile = (s: StoreState, id: string) =>
  s.drafts[id] ?? s.profiles.find((p) => p.id === id)?.profile ?? defaultProfile();

export function setActive(id: string) {
  update((s) => ({ ...s, activeId: id }));
}

export function editDraft(id: string, profile: Profile) {
  update((s) => {
    const saved = s.profiles.find((p) => p.id === id);
    const drafts = { ...s.drafts };
    if (saved && sameProfile(saved.profile, profile)) delete drafts[id];
    else drafts[id] = profile;
    return { ...s, drafts };
  });
}

export function saveDraft(id: string) {
  update((s) => {
    const draft = s.drafts[id];
    if (!draft) return s;
    const drafts = omit(s.drafts, id);
    return {
      ...s,
      drafts,
      profiles: s.profiles.map((p) => (p.id === id ? { ...p, profile: draft, updatedAt: Date.now() } : p)),
    };
  });
}

export function discardDraft(id: string) {
  update((s) => {
    const drafts = omit(s.drafts, id);
    return { ...s, drafts };
  });
}

export function createProfile(name: string, profile: Profile = defaultProfile()): string {
  const id = newId();
  update((s) => ({
    ...s,
    activeId: id,
    profiles: [...s.profiles, { id, name: name.trim() || "Untitled", updatedAt: Date.now(), profile }],
  }));
  return id;
}

/** Copies a profile, including its unsaved edits, into a new saved profile. */
export function duplicateProfile(id: string, name: string): string {
  return createProfile(name, workingProfile(getState(), id));
}

export function renameProfile(id: string, name: string) {
  const trimmed = name.trim().slice(0, 60);
  if (!trimmed) return;
  update((s) => ({
    ...s,
    profiles: s.profiles.map((p) => (p.id === id ? { ...p, name: trimmed } : p)),
  }));
}

export function deleteProfile(id: string) {
  update((s) => {
    const profiles = s.profiles.filter((p) => p.id !== id);
    const drafts = omit(s.drafts, id);
    if (profiles.length === 0) {
      const fresh = { id: newId(), name: "My profile", updatedAt: Date.now(), profile: defaultProfile() };
      return { profiles: [fresh], activeId: fresh.id, drafts };
    }
    return { profiles, drafts, activeId: s.activeId === id ? profiles[0].id : s.activeId };
  });
}
