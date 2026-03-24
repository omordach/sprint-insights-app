import { renderHook, act } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import { useDashboardFilters } from './useDashboardFilters';
import type { JiraStatRow } from '@/types/jira';

const mockRows: JiraStatRow[] = [
  {
    sprint: 'Sprint 1',
    user: 'Alice',
    issueType: 'Bug',
    status: 'Done',
    issuesCreated: 1,
    issuesUpdated: 1,
    issuesAssigned: 1,
    issuesCommented: 1,
    commentsCount: 1,
    timeLoggedSeconds: 3600,
  },
  {
    sprint: 'Sprint 1',
    user: 'Bob',
    issueType: 'Story',
    status: 'In Progress',
    issuesCreated: 2,
    issuesUpdated: 2,
    issuesAssigned: 2,
    issuesCommented: 2,
    commentsCount: 2,
    timeLoggedSeconds: 7200,
  },
  {
    sprint: 'Sprint 2',
    user: 'Alice',
    issueType: 'Story',
    status: 'To Do',
    issuesCreated: 3,
    issuesUpdated: 3,
    issuesAssigned: 3,
    issuesCommented: 3,
    commentsCount: 3,
    timeLoggedSeconds: 10800,
  },
];

describe('useDashboardFilters', () => {
  test('initial state should have empty filters and all rows', () => {
    const { result } = renderHook(() => useDashboardFilters(mockRows));

    expect(result.current.filters).toEqual({
      sprint: [],
      month: [],
      user: [],
      issueType: [],
      status: [],
    });
    expect(result.current.filteredRows).toEqual(mockRows);
  });

  test('updateFilter should update filters and filter rows correctly', () => {
    const { result } = renderHook(() => useDashboardFilters(mockRows));

    act(() => {
      result.current.updateFilter('sprint', ['Sprint 1']);
    });

    expect(result.current.filters.sprint).toEqual(['Sprint 1']);
    expect(result.current.filteredRows).toHaveLength(2);
    expect(result.current.filteredRows[0].user).toBe('Alice');
    expect(result.current.filteredRows[1].user).toBe('Bob');

    act(() => {
      result.current.updateFilter('user', ['Alice']);
    });

    expect(result.current.filters.user).toEqual(['Alice']);
    expect(result.current.filteredRows).toHaveLength(1);
    expect(result.current.filteredRows[0].sprint).toBe('Sprint 1');
    expect(result.current.filteredRows[0].user).toBe('Alice');
  });

  test('clearFilters should reset filters and return all rows', () => {
    const { result } = renderHook(() => useDashboardFilters(mockRows));

    act(() => {
      result.current.updateFilter('sprint', ['Sprint 1']);
      result.current.updateFilter('user', ['Alice']);
    });

    expect(result.current.filteredRows).toHaveLength(1);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({
      sprint: [],
      month: [],
      user: [],
      issueType: [],
      status: [],
    });
    expect(result.current.filteredRows).toEqual(mockRows);
  });
});
