import React from 'react';
import { Search, X } from 'lucide-react';
import { Filters, SortOption, TaskStatus, TaskPriority, SortField, SortOrder } from '../../types';
import { TextInput } from '../ui/TextInput';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface FilterBarProps {
  filters: Filters;
  sort: SortOption;
  onChange: (filters: Filters, sort: SortOption) => void;
  defaultFilters: Filters;
  defaultSort: SortOption;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  sort,
  onChange,
  defaultFilters,
  defaultSort,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value }, sort);
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, priority: e.target.value as TaskPriority | '' }, sort);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, order] = e.target.value.split('-') as [SortField, SortOrder];
    onChange(filters, { field, order });
  };

  const toggleStatus = (status: TaskStatus) => {
    const isSelected = filters.status.includes(status);
    let newStatus: TaskStatus[];

    if (isSelected) {
      newStatus = filters.status.filter((s) => s !== status);
    } else {
      newStatus = [...filters.status, status];
    }

    onChange({ ...filters, status: newStatus }, sort);
  };

  const isFiltersDirty = 
    filters.search !== defaultFilters.search ||
    filters.priority !== defaultFilters.priority ||
    filters.status.length !== defaultFilters.status.length ||
    !filters.status.every((s) => defaultFilters.status.includes(s)) ||
    sort.field !== defaultSort.field ||
    sort.order !== defaultSort.order;

  const handleClearFilters = () => {
    onChange(defaultFilters, defaultSort);
  };

  // Convert sort state to single string key for dropdown selection
  const sortValueKey = `${sort.field}-${sort.order}`;

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'Low', label: 'Low Priority' },
    { value: 'Medium', label: 'Medium Priority' },
    { value: 'High', label: 'High Priority' },
  ];

  const sortOptions = [
    { value: 'updatedAt-desc', label: 'Last Updated (Newest)' },
    { value: 'updatedAt-asc', label: 'Last Updated (Oldest)' },
    { value: 'createdAt-desc', label: 'Date Created (Newest)' },
    { value: 'createdAt-asc', label: 'Date Created (Oldest)' },
    { value: 'priority-desc', label: 'Priority: High to Low' },
    { value: 'priority-asc', label: 'Priority: Low to High' },
  ];

  return (
    <div className="card filter-bar-card">
      <div className="filter-bar-grid">
        {/* Search */}
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label" htmlFor="board-search">
            Search Tasks
          </label>
          <div style={{ position: 'relative' }}>
            <TextInput
              id="board-search"
              placeholder="Search title & description..."
              value={filters.search}
              onChange={handleSearchChange}
              style={{ paddingLeft: '2.25rem', marginBottom: 0 }}
              aria-label="Search title and description"
            />
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Priority Filter */}
        <Select
          id="board-priority-filter"
          label="Filter Priority"
          value={filters.priority}
          options={priorityOptions}
          onChange={handlePriorityChange}
          style={{ marginBottom: 0 }}
          aria-label="Filter tasks by priority"
        />

        {/* Sorting Dropdown */}
        <Select
          id="board-sort"
          label="Sort By"
          value={sortValueKey}
          options={sortOptions}
          onChange={handleSortChange}
          style={{ marginBottom: 0 }}
          aria-label="Sort tasks by criteria"
        />

        {/* Status Multi-Select Filter */}
        <div className="multi-select-container">
          <span className="input-label">Columns Displayed</span>
          <div className="multi-select-options">
            {(['Backlog', 'In Progress', 'Done'] as TaskStatus[]).map((status) => {
              const isActive = filters.status.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  className={`multi-select-btn focus-ring ${isActive ? 'active' : ''}`}
                  onClick={() => toggleStatus(status)}
                  aria-pressed={isActive}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isFiltersDirty && (
        <div className="filter-clear-section" style={{ marginTop: 'var(--spacing-sm)' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearFilters}
            aria-label="Clear all active filters and sorting"
          >
            <X size={14} /> Clear Filters & Sort
          </Button>
        </div>
      )}
    </div>
  );
};
