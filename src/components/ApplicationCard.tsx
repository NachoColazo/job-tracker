import type { JobApplication } from "../types";

/**
 * Props needed to render a single job application card.
 * The card receives the application data and a delete handler from App.
 */
type ApplicationCardProps = {
  application: JobApplication;
  onDelete: (id: number) => void;
};

/**
 * Formats the stored date string into a more readable date.
 * The app stores dates as "YYYY-MM-DD", but displays them as "Month Day, Year".
 */

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Displays a single job application.
 * This component is responsible only for rendering the card UI.
 */
function ApplicationCard({ application, onDelete }: ApplicationCardProps) {
  return (
    <article className="card">
      <div>
        <h3>{application.company}</h3>
        <p>{application.position}</p>
        <span>{application.status}</span>

        {application.dateApplied && (
          <p className="date">
            Applied on: {formatDate(application.dateApplied)}
          </p>
        )}

        {application.jobLink && (
          <a
            className="job-link"
            href={application.jobLink}
            target="_blank"
            rel="noreferrer"
          >
            View job posting
          </a>
        )}

        {application.notes && <p className="notes">{application.notes}</p>}
      </div>

      <button
        className="delete"
        type="button"
        onClick={() => onDelete(application.id)}
      >
        Delete
      </button>
    </article>
  );
}

export default ApplicationCard;
