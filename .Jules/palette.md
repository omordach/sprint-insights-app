## 2024-03-22 - Interactive Tag/Badge Accessibility
**Learning:** Components functioning as deletable tags or filters often lack keyboard accessibility because they are styled `div` or `span` elements. Screen reader users and keyboard navigators can easily be locked out of interactive UI elements.
**Action:** When creating a dismissible/deletable chip or badge, always convert it to an accessible button using `role="button"`, `tabIndex={0}`, an appropriate `aria-label`, and ensure `onKeyDown` handles standard `Enter` and `Space` key actions to clear the filter.
