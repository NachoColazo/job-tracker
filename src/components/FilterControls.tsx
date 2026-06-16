import type { TranslationContent } from "../translations";
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
  filterText: TranslationContent["filters"];
  statusFilterLabels: TranslationContent["statusFilterLabels"];
  sortLabels: TranslationContent["sortLabels"];
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
  filterText,
  statusFilterLabels,
  sortLabels,
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
          placeholder={filterText.searchPlaceholder}
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />

        {searchTerm.length > 0 && (
          <button
            className="clear-search"
            type="button"
            onClick={() => onSearchChange("")}
            aria-label={filterText.clearSearchLabel}
            title={filterText.clearSearchLabel}
          >
            ×
          </button>
        )}
      </div>

      <div className="filter">
        <label htmlFor="status-filter">{filterText.filterLabel}</label>

        <select
          id="status-filter"
          value={statusFilter}
          onChange={(event) =>
            onStatusFilterChange(event.target.value as StatusFilter)
          }
        >
          <option value="All">{statusFilterLabels.All}</option>
          <option value="Applied">{statusFilterLabels.Applied}</option>
          <option value="Interview">{statusFilterLabels.Interview}</option>
          <option value="Rejected">{statusFilterLabels.Rejected}</option>
          <option value="Offer">{statusFilterLabels.Offer}</option>
          <option value="Saved">{statusFilterLabels.Saved}</option>
        </select>
      </div>

      <div className="filter">
        <label htmlFor="sort-option">{filterText.sortLabel}</label>

        <select
          id="sort-option"
          value={sortOption}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
        >
          <option value="newest">{sortLabels.newest}</option>
          <option value="oldest">{sortLabels.oldest}</option>
        </select>
      </div>
    </>
  );
}

export default FilterControls;
