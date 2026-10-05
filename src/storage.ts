import type { Language } from "./translations";
import type { JobApplication } from "./types";
import { isJobApplicationList } from "./validation";

export type StorageIssue = "invalid-data" | "read-error" | "write-error";

export type ApplicationStorageState = {
  applications: JobApplication[];
  issue: StorageIssue | null;
  // A failed load must never be followed by an automatic overwrite.
  canSave: boolean;
};

export type LanguageStorageState = {
  language: Language;
  issue: StorageIssue | null;
};

const APPLICATIONS_KEY = "job-applications";
const LANGUAGE_KEY = "job-tracker-language";

function readStoredValue(key: string):
  | { ok: true; value: string | null }
  | { ok: false } {
  try {
    // Accessing localStorage itself can throw, not just getItem().
    return { ok: true, value: localStorage.getItem(key) };
  } catch {
    return { ok: false };
  }
}

export function loadApplications(): ApplicationStorageState {
  const result = readStoredValue(APPLICATIONS_KEY);
  if (!result.ok) {
    return { applications: [], issue: "read-error", canSave: false };
  }
  if (result.value === null) {
    return { applications: [], issue: null, canSave: true };
  }

  try {
    const parsed: unknown = JSON.parse(result.value);
    if (isJobApplicationList(parsed)) {
      return { applications: parsed, issue: null, canSave: true };
    }
  } catch {
    // Keep the original value in storage, including malformed JSON.
  }
  return { applications: [], issue: "invalid-data", canSave: false };
}

export function saveApplications(applications: JobApplication[]): boolean {
  try {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
    return true;
  } catch {
    return false;
  }
}

export function loadLanguage(): LanguageStorageState {
  const result = readStoredValue(LANGUAGE_KEY);
  if (!result.ok) return { language: "en", issue: "read-error" };
  if (result.value === null) return { language: "en", issue: null };
  if (result.value === "en" || result.value === "es") {
    return { language: result.value, issue: null };
  }
  return { language: "en", issue: "invalid-data" };
}

export function saveLanguage(language: Language): boolean {
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
    return true;
  } catch {
    return false;
  }
}
