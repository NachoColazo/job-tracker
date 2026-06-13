/**
 * Defines the shape of a job application in the app.
 * Keeping this as a TypeScript type helps prevent invalid data,
 * especially for the status field.
 */
export type JobApplication = {
  id: number;
  company: string;
  position: string;
  status: "Applied" | "Interview" | "Rejected" | "Offer" | "Saved";
  dateApplied: string;
  jobLink: string;
  notes: string;
};

/**
 * Represents the available status filter values.
 * "All" is used only for filtering and is not a real application status.
 */
export type StatusFilter = "All" | JobApplication["status"];

/**
 * Represents the available sorting options for the applications list.
 */
export type SortOption = "newest" | "oldest";