# 04: Floating Mascot with Dynamic Idle & Reactive Emotions

**What to build:**
An animated SVG mascot rendered in a floating container at the bottom-right corner of the viewport. When left alone, the mascot exhibits living idle behaviors (lounging, sleeping with animated Zzz). When tasks are completed, it plays a celebration animation. When overdue tasks exist, it enters an alert state for 10 seconds before decaying back to idle mode.

**Blocked by:**
03: Due Dates, Overdue Indicator & Status Filters

**Status:** completed

- [x] Floating avatar container positioned in the bottom-right viewport without blocking task list interactions.
- [x] Mascot renders animated SVG expressions and poses matching mood states (`idle_lounge`, `idle_sleep`, `celebrating`, `alert_overdue`).
- [x] Inactivity timer triggers transition from neutral to `idle_lounge` (30s) and `idle_sleep` (60s).
- [x] Marking any task as complete triggers a 5-second `celebrating` reaction.
- [x] Detection of overdue tasks triggers an `alert_overdue` mood with a 10-second decay timer back to idle.
- [x] Automated tests verify the avatar mood transition machine and decay behavior.
