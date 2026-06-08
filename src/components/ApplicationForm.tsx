import { useState, type SyntheticEvent } from "react";
import type { JobApplication } from "../types";

/**
 * Props needed to create a new job application.
 * App owns the applications list, so the form sends the new application up through this function.
 */
type ApplicationFormProps = {
  onAddApplication: (application: JobApplication) => void;
};

function ApplicationForm({ onAddApplication }: ApplicationFormProps) {
  /**
   * Form state.
   * Each input is controlled by React, which means the displayed value
   * always comes from state and updates through its setter function.
   */
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState<JobApplication["status"]>("Applied");
  const [dateApplied, setDateApplied] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [notes, setNotes] = useState("");

  /**
   * Creates a new application from the current form values
   * and adds it to the top of the list.
   */
  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const newApplication: JobApplication = {
      id: Date.now(),
      company,
      position,
      status,
      dateApplied,
      jobLink,
      notes,
    };

    onAddApplication(newApplication);

    // Reset the form after submitting.
    setCompany("");
    setPosition("");
    setStatus("Applied");
    setDateApplied("");
    setJobLink("");
    setNotes("");
  }
  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Company"
        value={company}
        onChange={(event) => setCompany(event.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Position"
        value={position}
        onChange={(event) => setPosition(event.target.value)}
        required
      />

      <select
        value={status}
        onChange={(event) =>
          setStatus(event.target.value as JobApplication["status"])
        }
      >
        <option value="Applied">Applied</option>
        <option value="Interview">Interview</option>
        <option value="Rejected">Rejected</option>
        <option value="Offer">Offer</option>
        <option value="Saved">Saved</option>
      </select>

      <input
        type="date"
        value={dateApplied}
        onChange={(event) => setDateApplied(event.target.value)}
      />

      <input
        type="url"
        placeholder="Job link"
        value={jobLink}
        onChange={(event) => setJobLink(event.target.value)}
      />

      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />

      <button type="submit">Add application</button>
    </form>
  );
}

export default ApplicationForm;
