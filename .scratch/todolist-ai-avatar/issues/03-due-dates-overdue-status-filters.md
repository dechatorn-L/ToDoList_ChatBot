# 03: Due Dates, Overdue Indicator & Status Filters

**What to build:**
Users can set due dates on tasks using an intuitive date picker. Any task with an uncompleted due date prior to today's local date displays a prominent "Overdue" warning badge. Users can filter the task view by "All", "Active", and "Completed", with a dynamic counter showing remaining active items.

**Blocked by:**
02: Task Completion, Priority Tiers & Deletion

**Status:** ready-for-agent

- [x] Task input and task items allow setting and updating an optional due date (`YYYY-MM-DD`).
- [x] Tasks past their due date that are not completed display an "Overdue" status badge.
- [x] Filter tabs allow switching between "All", "Active", and "Completed" views.
- [x] Active items counter accurately reflects the number of uncompleted tasks.
- [x] Automated tests verify due date validation, overdue calculation relative to local time, and filter state transitions.
