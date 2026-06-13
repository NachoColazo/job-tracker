import type { SortOption, StatusFilter } from "../types";

/**
 * Props needed to render and control the search bar, status filter,
 * and sorting option.
 * The state still lives in App, but this component renders the controls.
 */
type FilterControlsProps = {
  searchTerm: string;
  statusFilter: StatusFilter;
  sortOption: SortOption;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onSortChange: (value: SortOption) => void;
};

/**
 * Displays the search input, clear search button, status filter,
 * and date sorting control.
 * This component is controlled by App through props.
 */
function FilterControls({
  searchTerm,
  statusFilter,
  sortOption,
  onSearchChange,
  onStatusFilterChange,
  onSortChange,
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

      <div className="filter">
        <label htmlFor="sort-option">Sort by date</label>

        <select
          id="sort-option"
          value={sortOption}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>
    </>
  );
}

export default FilterControls;
