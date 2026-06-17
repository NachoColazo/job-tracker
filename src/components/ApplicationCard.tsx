import type { TranslationContent } from "../translations";
import type { JobApplication } from "../types";

/**
 * Props needed to render a single job application card.
 * The card receives the application data, translated UI text,
 * translated status labels, and a delete handler from App.
 */
type ApplicationCardProps = {
  application: JobApplication;
  cardText: TranslationContent["card"];
  statusLabels: TranslationContent["statusLabels"];
  onEdit: (application: JobApplication) => void;
  onDelete: (id: number) => void;
};

/**
 * Formats the stored date string into a more readable date.
 * The app stores dates as "YYYY-MM-DD", but displays them using
 * the current UI language.
 */
function formatDate(dateString: string, locale: string) {
  const [year, month, day] = dateString.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  ).toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Displays a single job application.
 * This component is responsible only for rendering the card UI.
 */
function ApplicationCard({
  application,
  cardText,
  statusLabels,
  onEdit,
  onDelete,
}: ApplicationCardProps) {
  return (
    <article className="card">
      <div>
        <h3>{application.company}</h3>
        <p>{application.position}</p>

        <span className={`status status-${application.status.toLowerCase()}`}>
          {statusLabels[application.status]}
        </span>

        {application.dateApplied && (
          <p className="date">
            {cardText.appliedOn}:{" "}
            {formatDate(application.dateApplied, cardText.dateLocale)}
          </p>
        )}

        {application.jobLink && (
          <a
            className="job-link"
            href={application.jobLink}
            target="_blank"
            rel="noreferrer"
          >
            {cardText.viewJobPosting}
          </a>
        )}

        {application.notes && <p className="notes">{application.notes}</p>}
      </div>

      <div className="card-actions">
        <button
          className="edit"
          type="button"
          onClick={() => onEdit(application)}
        >
          {cardText.edit}
        </button>

        <button
          className="delete"
          type="button"
          onClick={() => onDelete(application.id)}
        >
          {cardText.delete}
        </button>
      </div>
    </article>
  );
}

export default ApplicationCard;
