import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import type { TranslationContent } from "../translations";
import type { JobApplication } from "../types";
import { getValidJobUrl, isValidDate } from "../validation";

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
  // A partial/invalid native date can have an empty value without being optional.
  const [dateHasBadInput, setDateHasBadInput] = useState(false);
  const [rating, setRating] = useState(String(editingApplication?.rating ?? ""));
  const [jobLink, setJobLink] = useState(editingApplication?.jobLink ?? "");
  const [notes, setNotes] = useState(editingApplication?.notes ?? "");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const companyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingApplication) {
      // The keyed Edit form has mounted; synchronize focus with its DOM input.
      companyInputRef.current?.focus({ preventScroll: true });
    }
  }, [editingApplication]);

  const trimmedCompany = company.trim();
  const trimmedPosition = position.trim();
  const trimmedJobLink = jobLink.trim();
  const validJobLink = trimmedJobLink === "" ? "" : getValidJobUrl(trimmedJobLink);
  const validDate = isValidDate(dateApplied) && !dateHasBadInput;
  const companyInvalid = hasSubmitted && trimmedCompany === "";
  const positionInvalid = hasSubmitted && trimmedPosition === "";
  const dateInvalid = hasSubmitted && !validDate;
  const jobLinkInvalid = hasSubmitted && validJobLink === null;

  /**
   * Clears all form fields and returns the status to its default value.
   */
  function resetForm() {
    setCompany("");
    setPosition("");
    setStatus("Applied");
    setDateApplied("");
    setDateHasBadInput(false);
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
    if (
      trimmedCompany === "" ||
      trimmedPosition === "" ||
      validJobLink === null ||
      !validDate
    ) {
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
        <label htmlFor="application-company">{formText.companyLabel}</label>
        <input
          id="application-company"
          ref={companyInputRef}
          type="text"
          placeholder={formText.companyPlaceholder}
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          aria-invalid={companyInvalid}
          aria-describedby={companyInvalid ? "application-company-error" : undefined}
          required
        />
        {companyInvalid && (
          <p id="application-company-error" className="form-error" role="alert">
            {formText.companyRequired}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="application-position">{formText.positionLabel}</label>
        <input
          id="application-position"
          type="text"
          placeholder={formText.positionPlaceholder}
          value={position}
          onChange={(event) => setPosition(event.target.value)}
          aria-invalid={positionInvalid}
          aria-describedby={positionInvalid ? "application-position-error" : undefined}
          required
        />
        {positionInvalid && (
          <p id="application-position-error" className="form-error" role="alert">
            {formText.positionRequired}
          </p>
        )}
      </div>

      <div className="form-field form-full">
        <label htmlFor="application-status">{formText.statusLabel}</label>
        <select
          id="application-status"
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
      </div>

      <div className="form-field">
        <label htmlFor="application-rating">{formText.ratingLabel}</label>
        <select
          id="application-rating"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
        >
          <option value="">{formText.ratingPlaceholder}</option>
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
      </div>

      <div className="form-field">
        <label htmlFor="application-date">{formText.dateLabel}</label>
        <input
          id="application-date"
          type="date"
          value={dateApplied}
          onChange={(event) => setDateApplied(event.target.value)}
          onInput={(event) => setDateHasBadInput(event.currentTarget.validity.badInput)}
          onInvalid={() => setDateHasBadInput(true)}
          aria-invalid={dateInvalid}
          aria-describedby={dateInvalid ? "application-date-error" : undefined}
          title={formText.dateLabel}
        />
        {dateInvalid && (
          <p id="application-date-error" className="form-error" role="alert">
            {formText.dateInvalid}
          </p>
        )}
      </div>

      <div className="form-field form-full">
        <label className="sr-only" htmlFor="application-job-link">{formText.jobLinkLabel}</label>
        <input
          id="application-job-link"
          type="url"
          placeholder={formText.jobLinkPlaceholder}
          value={jobLink}
          onChange={(event) => setJobLink(event.target.value)}
          aria-invalid={jobLinkInvalid}
          aria-describedby={jobLinkInvalid ? "application-job-link-error" : undefined}
        />
        {jobLinkInvalid && (
          <p id="application-job-link-error" className="form-error" role="alert">
            {formText.jobLinkInvalid}
          </p>
        )}
      </div>

      <div className="form-field form-full">
        <label className="sr-only" htmlFor="application-notes">{formText.notesLabel}</label>
        <textarea
          id="application-notes"
          placeholder={formText.notesPlaceholder}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

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
