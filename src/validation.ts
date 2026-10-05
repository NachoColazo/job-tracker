import type { JobApplication } from "./types";

/** Return a normalized web URL, or null for malformed/unsupported links. */
export function getValidJobUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

/** Accept an empty optional date or a real calendar date in YYYY-MM-DD format. */
function isValidDate(value: string): boolean {
  if (value === "") return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;

  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysPerMonth = [
    31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
  ];
  return day <= daysPerMonth[month - 1];
}

/** TypeScript types do not validate JSON. Check stored values before using them. */
function isJobApplication(value: unknown): value is JobApplication {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const application = value as Record<string, unknown>;
  return (
    typeof application.id === "number" &&
    Number.isSafeInteger(application.id) &&
    application.id > 0 &&
    typeof application.company === "string" &&
    typeof application.position === "string" &&
    (application.status === "Applied" ||
      application.status === "Interview" ||
      application.status === "Rejected" ||
      application.status === "Offer" ||
      application.status === "Saved") &&
    typeof application.dateApplied === "string" &&
    isValidDate(application.dateApplied) &&
    typeof application.jobLink === "string" &&
    typeof application.notes === "string" &&
    (application.rating === undefined ||
      (typeof application.rating === "number" &&
        Number.isInteger(application.rating) &&
        application.rating >= 1 &&
        application.rating <= 10))
  );
}

export function isJobApplicationList(value: unknown): value is JobApplication[] {
  if (!Array.isArray(value)) return false;

  const ids = new Set<number>();
  for (const application of value) {
    if (!isJobApplication(application) || ids.has(application.id)) return false;
    ids.add(application.id);
  }
  return true;
}
