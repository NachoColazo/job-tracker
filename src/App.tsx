import { useEffect, useState } from "react";
import ApplicationCard from "./components/ApplicationCard";
import FilterControls from "./components/FilterControls";
import type { JobApplication, StatusFilter } from "./types";
import "./App.css";

function App() {
  /**
   * Load saved applications from the browser when the app starts.
   * localStorage only stores strings, so saved data must be parsed back into an array.
   */
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const savedApplications = localStorage.getItem("job-applications");

    return savedApplications ? JSON.parse(savedApplications) : [];
  });

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
   * Controls which applications are visible in the list.
   * "All" is not a real application status, so we combine it with the valid status values.
   */
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  /**
   * Stores the current search text used to filter applications
   * by company or position.
   */
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * Persist applications every time the list changes.
   * This keeps the data available after refreshing the page.
   */
  useEffect(() => {
    localStorage.setItem("job-applications", JSON.stringify(applications));
  }, [applications]);

  /**
   * Derived data: this does not need its own state.
   * It is calculated from the current applications, selected status filter,
   * and search text.
   */
  const filteredApplications = applications.filter((application) => {
    const matchesStatus =
      statusFilter === "All" || application.status === statusFilter;

    const matchesSearch =
      application.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.position.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  /**
   * Creates a new application from the current form values
   * and adds it to the top of the list.
   */
  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
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

    setApplications([newApplication, ...applications]);

    // Reset the form after submitting.
    setCompany("");
    setPosition("");
    setStatus("Applied");
    setDateApplied("");
    setJobLink("");
    setNotes("");
  }

  /**
   * Removes one application by keeping every item
   * except the one that matches the selected id.
   */
  function deleteApplication(id: number) {
    setApplications(
      applications.filter((application) => application.id !== id),
    );
  }

  /**
   * Clears the full list only after user confirmation.
   * This prevents accidentally deleting all saved applications.
   */
  function clearAllApplications() {
    if (window.confirm("Are you sure you want to clear all applications?")) {
      setApplications([]);
    }
  }

  return (
    <main className="container">
      <section className="hero">
        <h1>Programming Comeback Tracker</h1>
        <p>Small steps every day to get back into tech.</p>
      </section>

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

      <section className="list">
        <h2>
          Applications: {filteredApplications.length} of {applications.length}
        </h2>

        <FilterControls
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
        />

        {applications.length > 0 && (
          <button className="clear" onClick={clearAllApplications}>
            Clear all
          </button>
        )}

        {filteredApplications.length === 0 ? (
          <p className="empty">No applications match your filters.</p>
        ) : (
          filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onDelete={deleteApplication}
            />
          ))
        )}
      </section>
    </main>
  );
}

export default App;
