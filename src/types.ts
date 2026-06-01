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