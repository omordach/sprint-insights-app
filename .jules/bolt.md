
## 2024-03-22 - [FilterBar React.memo Optimization]
**Learning:** React components containing multiple complex form elements (like shadcn/ui Selects) are prone to unnecessary re-renders when parent state changes. When iterating over a list of items and passing callbacks, inline arrow functions break referential equality and defeat `React.memo()`.
**Action:** When a parent component passes down event handlers to multiple memoized child components, always use `useCallback` for the handler in the parent, and refactor child component props to accept generic values (e.g. `filterKey`) and the stable callback function rather than relying on inline arrow closures.
