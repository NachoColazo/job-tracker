import type { StatusFilter } from "../types";

/**
 * Props needed to render and control the search bar and status filter.
 * The state still lives in App, but this component renders the controls.
 */
type FilterControlsProps = {
  searchTerm: string;
  statusFilter: StatusFilter;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
};

/**
 * Displays the search input, clear search button, and status filter.
 * This component is controlled by App through props.
 */
function FilterControls({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: FilterControlsProps) {
  return (
    <>
      <div className="search-row">
        <input
          className="search"
          type="text"
          placeholder="Search by company or position"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />

        {searchTerm.length > 0 && (
          <button
            className="clear-search"
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className="filter">
        <label htmlFor="status-filter">Filter by status</label>

        <select
          id="status-filter"
          value={statusFilter}
          onChange={(event) =>
            onStatusFilterChange(event.target.value as StatusFilter)
          }
        >
          <option value="All">All</option>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Rejected">Rejected</option>
          <option value="Offer">Offer</option>
          <option value="Saved">Saved</option>
        </select>
      </div>
    </>
  );
}

export default FilterControls;
