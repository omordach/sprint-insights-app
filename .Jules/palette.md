## 2024-03-22 - Interactive Tag/Badge Accessibility
**Learning:** Components functioning as deletable tags or filters often lack keyboard accessibility because they are styled `div` or `span` elements. Screen reader users and keyboard navigators can easily be locked out of interactive UI elements.
**Action:** When creating a dismissible/deletable chip or badge, always convert it to an accessible button using `role="button"`, `tabIndex={0}`, an appropriate `aria-label`, and ensure `onKeyDown` handles standard `Enter` and `Space` key actions to clear the filter.

## 2024-03-22 - Empty State with Actionable Steps
**Learning:** Empty states without a clear call-to-action can leave users feeling stuck. By simply providing a "Clear all filters" button directly within the Empty State (instead of relying on the filter bar's clear button), users have an immediate, obvious way to recover when their search yields no results.
**Action:** Always include actionable next steps or recovery buttons (like "Clear filters" or "Create new") within empty state components to improve usability and keep users engaged.
