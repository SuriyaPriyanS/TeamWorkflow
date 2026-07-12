import { useState, useEffect, useCallback } from 'react';
import { Filters, SortOption, TaskStatus, TaskPriority, SortField, SortOrder } from '../types';

const DEFAULT_FILTERS: Filters = {
  status: ['Backlog', 'In Progress', 'Done'],
  priority: '',
  search: '',
};

const DEFAULT_SORT: SortOption = {
  field: 'updatedAt',
  order: 'desc',
};

export const useQueryParams = () => {
  // Parse URL search parameters
  const parseParams = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Status filter
    const statusParam = params.get('status');
    const status: TaskStatus[] = statusParam
      ? (statusParam.split(',').filter(s => ['Backlog', 'In Progress', 'Done'].includes(s)) as TaskStatus[])
      : DEFAULT_FILTERS.status;

    // Priority filter
    const priorityParam = params.get('priority');
    const priority = (priorityParam && ['Low', 'Medium', 'High'].includes(priorityParam))
      ? (priorityParam as TaskPriority)
      : '';

    // Search query
    const search = params.get('search') || '';

    // Sort Field
    const sortByParam = params.get('sortBy');
    const field = (sortByParam && ['createdAt', 'updatedAt', 'priority'].includes(sortByParam))
      ? (sortByParam as SortField)
      : DEFAULT_SORT.field;

    // Sort Order
    const sortOrderParam = params.get('sortOrder');
    const order = (sortOrderParam && ['asc', 'desc'].includes(sortOrderParam))
      ? (sortOrderParam as SortOrder)
      : DEFAULT_SORT.order;

    return {
      filters: { status, priority, search },
      sort: { field, order },
    };
  }, []);

  const [state, setState] = useState(() => parseParams());

  // Listen to popstate event (back/forward browser buttons)
  useEffect(() => {
    const handlePopState = () => {
      setState(parseParams());
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [parseParams]);

  // Update query params in browser URL
  const updateParams = useCallback((filters: Filters, sort: SortOption) => {
    const params = new URLSearchParams();

    // Only set status if it is different from all selected (empty or subset)
    if (filters.status.length < 3) {
      if (filters.status.length > 0) {
        params.set('status', filters.status.join(','));
      } else {
        // If nothing is selected, we represent it as empty string
        params.set('status', '');
      }
    }

    if (filters.priority) {
      params.set('priority', filters.priority);
    }

    if (filters.search.trim()) {
      params.set('search', filters.search.trim());
    }

    if (sort.field !== DEFAULT_SORT.field) {
      params.set('sortBy', sort.field);
    }

    if (sort.order !== DEFAULT_SORT.order) {
      params.set('sortOrder', sort.order);
    }

    const searchString = params.toString();
    const newRelativePathQuery = window.location.pathname + (searchString ? `?${searchString}` : '');
    
    // Check if URL actually changed to prevent duplicate history records
    if (window.location.search !== (searchString ? `?${searchString}` : '')) {
      window.history.pushState(null, '', newRelativePathQuery);
    }

    setState({ filters, sort });
  }, []);

  return {
    filters: state.filters,
    sort: state.sort,
    updateParams,
    defaultFilters: DEFAULT_FILTERS,
    defaultSort: DEFAULT_SORT,
  };
};
