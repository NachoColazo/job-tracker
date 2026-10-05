import { useState, type SyntheticEvent } from "react";
import type { TranslationContent } from "../translations";
import type { JobApplication } from "../types";
import { getValidJobUrl } from "../validation";

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
   * App changes the form's key when switching between add mode and applications.
   * Each mount starts with the selected application's values or empty defaults.
   * Each input is controlled by React, which means the displayed value
   * always comes from state and updates through its setter function.
   */
  const [company, setCompany] = useState(editingApplication?.company ?? "");
  const [position, setPosition] = useState(editingApplication?.position ?? "");
  const [status, setStatus] = useState<JobApplication["status"]>(
    editingApplication?.status ?? "Applied",
  );
  const [dateApplied, setDateApplied] = useState(
    editingApplication?.dateApplied ?? "",
  );
  const [rating, setRating] = useState(String(editingApplication?.rating ?? ""));
  const [jobLink, setJobLink] = useState(editingApplication?.jobLink ?? "");
  const [notes, setNotes] = useState(editingApplication?.notes ?? "");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const trimmedCompany = company.trim();
  const trimmedPosition = position.trim();
  const trimmedJobLink = jobLink.trim();
  const validJobLink = trimmedJobLink === "" ? "" : getValidJobUrl(trimmedJobLink);

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
    setHasSubmitted(false);
  }

  /**
   * Creates a new application or updates the selected application,
   * depending on whether the form is in add mode or edit mode.
   */
  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    // Keep the draft unchanged and stop before calling either save callback.
    if (trimmedCompany === "" || trimmedPosition === "" || validJobLink === null) {
      return;
    }

    const applicationToSave: JobApplication = {
      id: editingApplication ? editingApplication.id : Date.now(),
      company: trimmedCompany,
      position: trimmedPosition,
      status,
      dateApplied,
      rating: rating ? Number(rating) : undefined,
      jobLink: validJobLink,
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
    <form
      className="form"
      onSubmit={handleSubmit}
      // Native validation can block submit first; still show our inline messages.
      onInvalid={() => setHasSubmitted(true)}
    >
      <div className="form-field">
        <input
          type="text"
          placeholder={formText.companyPlaceholder}
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          required
        />
        {hasSubmitted && trimmedCompany === "" && (
          <p className="form-error" role="alert">{formText.companyRequired}</p>
        )}
      </div>

      <div className="form-field">
        <input
          type="text"
          placeholder={formText.positionPlaceholder}
          value={position}
          onChange={(event) => setPosition(event.target.value)}
          required
        />
        {hasSubmitted && trimmedPosition === "" && (
          <p className="form-error" role="alert">{formText.positionRequired}</p>
        )}
      </div>

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

      <div className="form-field form-full">
        <input
          type="url"
          placeholder={formText.jobLinkPlaceholder}
          value={jobLink}
          onChange={(event) => setJobLink(event.target.value)}
        />
        {hasSubmitted && validJobLink === null && (
          <p className="form-error" role="alert">{formText.jobLinkInvalid}</p>
        )}
      </div>

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
