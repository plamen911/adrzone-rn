import { useEffect, useState } from 'react';
import { File, Paths } from 'expo-file-system';

const PREFS_FILE = 'user_prefs.json';
const RECENTS_LIMIT = 10;

export type UserPrefs = {
  favorites: number[];
  recents: number[];
  detailOpens: number;
  lastReviewPromptAt: number | null;
};

const EMPTY: UserPrefs = {
  favorites: [],
  recents: [],
  detailOpens: 0,
  lastReviewPromptAt: null,
};

const REVIEW_PROMPT_MIN_OPENS = 10;
const REVIEW_PROMPT_THROTTLE_MS = 60 * 24 * 60 * 60 * 1000; // 60 days

let cache: UserPrefs | null = null;
let loadPromise: Promise<UserPrefs> | null = null;
const listeners = new Set<(prefs: UserPrefs) => void>();

function file() {
  return new File(Paths.document, PREFS_FILE);
}

function notify(prefs: UserPrefs) {
  for (const l of listeners) l(prefs);
}

async function load(): Promise<UserPrefs> {
  if (cache) return cache;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    let next = EMPTY;
    try {
      const f = file();
      if (f.exists) {
        const parsed = JSON.parse(await f.text()) as Partial<UserPrefs>;
        next = {
          favorites: Array.isArray(parsed.favorites) ? parsed.favorites.filter(Number.isFinite) : [],
          recents: Array.isArray(parsed.recents) ? parsed.recents.filter(Number.isFinite) : [],
          detailOpens: typeof parsed.detailOpens === 'number' ? parsed.detailOpens : 0,
          lastReviewPromptAt:
            typeof parsed.lastReviewPromptAt === 'number' ? parsed.lastReviewPromptAt : null,
        };
      }
    } catch {
      next = EMPTY;
    }
    cache = next;
    return next;
  })();
  return loadPromise;
}

function persist(next: UserPrefs) {
  cache = next;
  notify(next);
  try {
    file().write(JSON.stringify(next));
  } catch {
    // silent — disk failure shouldn't break the UI
  }
}

export async function toggleFavorite(id: number): Promise<boolean> {
  const prefs = await load();
  const has = prefs.favorites.includes(id);
  persist({
    ...prefs,
    favorites: has
      ? prefs.favorites.filter((x) => x !== id)
      : [id, ...prefs.favorites],
  });
  return !has;
}

export async function recordRecent(id: number): Promise<void> {
  const prefs = await load();
  persist({
    ...prefs,
    recents: [id, ...prefs.recents.filter((x) => x !== id)].slice(0, RECENTS_LIMIT),
  });
}

export async function clearRecents(): Promise<void> {
  const prefs = await load();
  if (prefs.recents.length === 0) return;
  persist({ ...prefs, recents: [] });
}

export async function recordDetailOpen(): Promise<number> {
  const prefs = await load();
  const next = prefs.detailOpens + 1;
  persist({ ...prefs, detailOpens: next });
  return next;
}

// Marks the review prompt as shown if engagement and throttle conditions are met.
// Returns true when the caller should actually invoke the system review sheet.
// Records the prompt time even on success-without-sheet to avoid retry loops.
export async function tryClaimReviewPrompt(): Promise<boolean> {
  const prefs = await load();
  if (prefs.detailOpens < REVIEW_PROMPT_MIN_OPENS) return false;
  if (
    prefs.lastReviewPromptAt !== null &&
    Date.now() - prefs.lastReviewPromptAt < REVIEW_PROMPT_THROTTLE_MS
  ) {
    return false;
  }
  persist({ ...prefs, lastReviewPromptAt: Date.now() });
  return true;
}

export function useUserPrefs(): UserPrefs {
  const [prefs, setPrefs] = useState<UserPrefs>(cache ?? EMPTY);

  useEffect(() => {
    let active = true;
    const onChange = (next: UserPrefs) => {
      if (active) setPrefs(next);
    };
    listeners.add(onChange);
    load().then((p) => active && setPrefs(p));
    return () => {
      active = false;
      listeners.delete(onChange);
    };
  }, []);

  return prefs;
}
