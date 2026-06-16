import { useState, type SyntheticEvent } from "react";
import type { TranslationContent } from "../translations";
import type { JobApplication } from "../types";

/**
 * Props needed to create a new job application.
 * App owns the applications list, so the form sends the new application up through this function.
 */
type ApplicationFormProps = {
  onAddApplication: (application: JobApplication) => void;
  formText: TranslationContent["form"];
  statusLabels: TranslationContent["statusLabels"];
};

function ApplicationForm({
  onAddApplication,
  formText,
  statusLabels,
}: ApplicationFormProps) {
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
   * and sends it to App so it can be stored in the main applications list.
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
        placeholder={formText.companyPlaceholder}
        value={company}
        onChange={(event) => setCompany(event.target.value)}
        required
      />

      <input
        type="text"
        placeholder={formText.positionPlaceholder}
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
        <option value="Applied">{statusLabels.Applied}</option>
        <option value="Interview">{statusLabels.Interview}</option>
        <option value="Rejected">{statusLabels.Rejected}</option>
        <option value="Offer">{statusLabels.Offer}</option>
        <option value="Saved">{statusLabels.Saved}</option>
      </select>

      <input
        type="date"
        value={dateApplied}
        onChange={(event) => setDateApplied(event.target.value)}
        aria-label={formText.dateLabel}
        title={formText.dateLabel}
      />

      <input
        type="url"
        placeholder={formText.jobLinkPlaceholder}
        value={jobLink}
        onChange={(event) => setJobLink(event.target.value)}
      />

      <textarea
        placeholder={formText.notesPlaceholder}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />

      <button type="submit">{formText.addButton}</button>
    </form>
  );
}

export default ApplicationForm;
