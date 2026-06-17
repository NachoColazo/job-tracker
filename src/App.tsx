import { useEffect, useState } from "react";
import ApplicationCard from "./components/ApplicationCard";
import ApplicationForm from "./components/ApplicationForm";
import FilterControls from "./components/FilterControls";
import { translations, type Language } from "./translations";
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
   * Stores the application currently being edited.
   * When this is null, the form is in "add" mode.
   * When it has an application, the form is in "edit" mode.
   */
  const [editingApplication, setEditingApplication] =
    useState<JobApplication | null>(null);

  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("job-tracker-language");

    return savedLanguage === "es" ? "es" : "en";
  });

  const t = translations[language];

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

  useEffect(() => {
    localStorage.setItem("job-tracker-language", language);
  }, [language]);

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
   * Updates an existing application by replacing the item
   * that has the same id as the edited application.
   */
  function updateApplication(updatedApplication: JobApplication) {
    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === updatedApplication.id
          ? updatedApplication
          : application,
      ),
    );

    setEditingApplication(null);
  }

  /**
   * Selects an application to edit and moves the user back to the form.
   */
  function startEditingApplication(application: JobApplication) {
    setEditingApplication(application);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * Leaves edit mode without saving changes.
   */
  function cancelEditingApplication() {
    setEditingApplication(null);
  }

  /**
   * Removes one application by keeping every item
   * except the one that matches the selected id.
   */
  function deleteApplication(id: number) {
    setApplications((currentApplications) =>
      currentApplications.filter((application) => application.id !== id),
    );

    if (editingApplication?.id === id) {
      setEditingApplication(null);
    }
  }

  /**
   * Clears the full list only after user confirmation.
   * This prevents accidentally deleting all saved applications.
   */
  function clearAllApplications() {
    if (window.confirm(t.list.clearAllConfirm)) {
      setApplications([]);
      setEditingApplication(null);
    }
  }

  function toggleLanguage() {
    setLanguage((currentLanguage) => (currentLanguage === "en" ? "es" : "en"));
  }

  return (
    <main className="container" lang={language}>
      <section className="hero">
        <div className="hero-actions">
          <button
            className={`language-toggle language-toggle-${language}`}
            onClick={toggleLanguage}
            type="button"
            aria-label="Toggle language"
          >
            <span>EN</span>
            <span>ES</span>
          </button>
        </div>

        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </section>

      <ApplicationForm
        editingApplication={editingApplication}
        onAddApplication={addApplication}
        onUpdateApplication={updateApplication}
        onCancelEdit={cancelEditingApplication}
        formText={t.form}
        statusLabels={t.statusLabels}
      />

      <section className="list">
        <h2>
          {t.list.applicationsCount}: {filteredApplications.length} {t.list.of}{" "}
          {applications.length}
        </h2>

        <FilterControls
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          sortOption={sortOption}
          filterText={t.filters}
          statusFilterLabels={t.statusFilterLabels}
          sortLabels={t.sortLabels}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onSortChange={setSortOption}
        />

        {applications.length > 0 && (
          <button className="clear" onClick={clearAllApplications}>
            {t.list.clearAll}
          </button>
        )}

        {applications.length === 0 ? (
          <p className="empty">{t.list.empty}</p>
        ) : filteredApplications.length === 0 ? (
          <p className="empty">{t.list.noMatches}</p>
        ) : (
          filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              cardText={t.card}
              statusLabels={t.statusLabels}
              onEdit={startEditingApplication}
              onDelete={deleteApplication}
            />
          ))
        )}
      </section>
    </main>
  );
}

export default App;
