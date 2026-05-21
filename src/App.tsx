import { useEffect, useState } from "react";
import "./App.css";

type JobApplication = {
  id: number;
  company: string;
  position: string;
  status: "Applied" | "Interview" | "Rejected" | "Offer" | "Saved";
  notes: string;
};

function App() {
  const [applications, setApplications] = useState<JobApplication[]>(() => {
  const savedApplications = localStorage.getItem("job-applications");

  return savedApplications ? JSON.parse(savedApplications) : [];
});


  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState<JobApplication["status"]>("Applied");
  const [notes, setNotes] = useState("");
  
  useEffect(() => {
  localStorage.setItem("job-applications", JSON.stringify(applications));
}, [applications]);

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const newApplication: JobApplication = {
      id: Date.now(),
      company,
      position,
      status,
      notes,
    };

    setApplications([newApplication, ...applications]);

    setCompany("");
    setPosition("");
    setStatus("Applied");
    setNotes("");
  }

  function deleteApplication(id: number) {
    setApplications(applications.filter((application) => application.id !== id));
  }

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

        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />

        <button type="submit">Add application</button>
      </form>

      <section className="list">
        <h2>Applications: {applications.length}</h2>

        {applications.length > 0 && (
          <button className="clear" onClick={clearAllApplications}>
            Clear all
          </button> 
        )}

        {applications.length === 0 ? (
          <p className="empty">No applications yet.</p>
        ) : (
          applications.map((application) => (
            <article className="card" key={application.id}>
              <div>
                <h3>{application.company}</h3>
                <p>{application.position}</p>
                <span>{application.status}</span>
                {application.notes && <p className="notes">{application.notes}</p>}
              </div>

              <button
                className="delete"
                onClick={() => deleteApplication(application.id)}
              >
                Delete
              </button>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default App;