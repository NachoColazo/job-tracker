import { useEffect, useState, type SyntheticEvent } from "react";
import type { TranslationContent } from "../translations";
import type { JobApplication } from "../types";

/**
 * Props needed to create a new job application.
 * App owns the applications list, so the form sends the new application up through this function.
 */
type ApplicationFormProps = {
  editingApplication: JobApplication | null;
  onAddApplication: (application: JobApplication) => void;
  onUpdateApplication: (application: JobApplication) => void;
  onCancelEdit: () => void;
  formText: TranslationContent["form"];
  statusLabels: TranslationContent["statusLabels"];
};

function ApplicationForm({
  editingApplication,
  onAddApplication,
  onUpdateApplication,
  onCancelEdit,
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
  const [rating, setRating] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [notes, setNotes] = useState("");

  /**
   * Clears all form fields and returns the status to its default value.
   */
  function resetForm() {
    setCompany("");
    setPosition("");
    setStatus("Applied");
    setDateApplied("");
    setRating("");
    setJobLink("");
    setNotes("");
  }

  /**
   * When an application is selected for editing,
   * fill the form with that application's current values.
   */
  useEffect(() => {
    if (editingApplication) {
      setCompany(editingApplication.company);
      setPosition(editingApplication.position);
      setStatus(editingApplication.status);
      setDateApplied(editingApplication.dateApplied);
      setRating(String(editingApplication.rating ?? ""));
      setJobLink(editingApplication.jobLink);
      setNotes(editingApplication.notes);
    } else {
      resetForm();
    }
  }, [editingApplication]);

  /**
   * Creates a new application or updates the selected application,
   * depending on whether the form is in add mode or edit mode.
   */
  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const applicationToSave: JobApplication = {
      id: editingApplication ? editingApplication.id : Date.now(),
      company,
      position,
      status,
      dateApplied,
      rating: rating ? Number(rating) : undefined,
      jobLink,
      notes,
    };

    if (editingApplication) {
      onUpdateApplication(applicationToSave);
    } else {
      onAddApplication(applicationToSave);
    }

    resetForm();
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
        className="form-full"
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

      <select
        value={rating}
        onChange={(event) => setRating(event.target.value)}
        aria-label={formText.ratingLabel}
      >
        <option value="">{formText.ratingLabel}</option>
        <option value="1">1 / 10</option>
        <option value="2">2 / 10</option>
        <option value="3">3 / 10</option>
        <option value="4">4 / 10</option>
        <option value="5">5 / 10</option>
        <option value="6">6 / 10</option>
        <option value="7">7 / 10</option>
        <option value="8">8 / 10</option>
        <option value="9">9 / 10</option>
        <option value="10">10 / 10</option>
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

      <button type="submit">
        {editingApplication ? formText.updateButton : formText.addButton}
      </button>

      {editingApplication && (
        <button className="cancel-edit" type="button" onClick={onCancelEdit}>
          {formText.cancelEditButton}
        </button>
      )}
    </form>
  );
}

export default ApplicationForm;
