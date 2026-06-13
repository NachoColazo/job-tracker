import { useEffect, useState } from "react";
import ApplicationCard from "./components/ApplicationCard";
import ApplicationForm from "./components/ApplicationForm";
import FilterControls from "./components/FilterControls";
import type { JobApplication, SortOption, StatusFilter } from "./types";
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
   * Controls how the visible applications are sorted.
   */
  const [sortOption, setSortOption] = useState<SortOption>("newest");

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
   * search text, and selected sort option.
   */
  const filteredApplications = applications
    .filter((application) => {
      const matchesStatus =
        statusFilter === "All" || application.status === statusFilter;

      const matchesSearch =
        application.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.position.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    })
    .sort((firstApplication, secondApplication) => {
      if (!firstApplication.dateApplied && !secondApplication.dateApplied) {
        return 0;
      }

      if (!firstApplication.dateApplied) {
        return 1;
      }

      if (!secondApplication.dateApplied) {
        return -1;
      }

      const firstDateValue = Number(
        firstApplication.dateApplied.split("-").join(""),
      );

      const secondDateValue = Number(
        secondApplication.dateApplied.split("-").join(""),
      );

      return sortOption === "newest"
        ? secondDateValue - firstDateValue
        : firstDateValue - secondDateValue;
    });

  /**
   * Adds a new application to the top of the list.
   * The form creates the application object and App stores it in state.
   */
  function addApplication(newApplication: JobApplication) {
    setApplications((currentApplications) => [
      newApplication,
      ...currentApplications,
    ]);
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

      <ApplicationForm onAddApplication={addApplication} />

      <section className="list">
        <h2>
          Applications: {filteredApplications.length} of {applications.length}
        </h2>

        <FilterControls
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          sortOption={sortOption}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onSortChange={setSortOption}
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
