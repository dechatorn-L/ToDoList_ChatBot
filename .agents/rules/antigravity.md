---
name: antigravity
description: Project execution rules and skill workflow governance for Todolist based on SKILLS_GUIDE.md
---

# Todolist Project Rules & Skill Workflow Governance

All agent actions in this project must strictly follow the pathways defined below and in [`SKILLS_GUIDE.md`](file:///c:/Projects/GO_ON/Todolist/SKILLS_GUIDE.md).

```
[PATH 1: FEATURE - TODOLIST]
/grill-me -> /to-spec -> /to-tickets -> [/scrutinize] -> [UI: ui-ux-pro-max + /impeccable] -> /implement (+ /tdd) -> /code-review + /scrutinize

[PATH 2: BUGFIX]
/debug-mantra (Repro -> Fail Path -> Falsify -> Ledger) -> Fix Root Cause -> /post-mortem

[PATH 3: REVIEW / AUDIT]
/scrutinize (Intent & Call Path) -> /code-review (Standards & Spec)
```

---

## 1. Feature Development Rules (Pathway 1)

Never jump straight into coding for new features or project setup. Follow this strict sequence:

1. **Scope & Clarify (Mandatory Entry Gate):**
   - **Todolist Entry Point:** Must strictly use `/grill-me`. (Do NOT use `/wayfinder`; Todolist scope is well-defined and must be resolved in a single focused interview).
   - Conduct a targeted interview resolving task model, storage strategy (e.g. LocalStorage vs DB), UI styling, and filtering behaviors.
2. **Specification:**
   - Execute `/to-spec`. Produce formal User Stories, Implementation Decisions, and Seam Testing strategy. Do NOT add speculative scope.
3. **Decomposition:**
   - Execute `/to-tickets`. Slice into vertical tracer-bullet tickets with explicit `Blocked by` dependencies.
   - *(Quality Gate 1)*: Run `/scrutinize` on the plan/spec to challenge over-engineering before writing any code.
4. **UI & Design Systems (if UI is involved):**
   - Strictly adhere to [`design-system/todolist-ai/MASTER.md`](file:///C:/Projects/GO_ON/Todolist/design-system/todolist-ai/MASTER.md) as the canonical Source of Truth for colors, typography (Plus Jakarta Sans), spacing, and component specs.
   - Use `ui-ux-pro-max` for tokens, layout consistency, and WCAG accessibility standards.
   - Use `impeccable` (e.g., `/impeccable polish`, `/impeccable craft`) to eliminate generic AI design (no purple gradients, no nested cards, no emoji icons).
5. **Implementation & Testing:**
   - Pick the frontier ticket (unblocked) and execute via `/implement`.
   - Strictly follow `/tdd`: Write failing tests first at public seams (Red), write minimal code to pass (Green). Never test private implementation details.
6. **Review & Ship (Quality Gate 2):**
   - Run `/scrutinize` to trace real runtime call paths end-to-end and catch boundary surprises.
   - Run `/code-review` in parallel: Standards (smells, formatting, repo conventions) and Spec (verifying acceptance criteria).

---

## 2. Bugfix & Incident Rules (Pathway 2)

Never guess, patch symptoms, or propose fixes without reproducible proof:

1. **Mandatory Investigation via `/debug-mantra`:**
   - *Step 1 (Repro):* Build a fast, deterministic failing test or reproduction script. If no repro exists, STOP and report.
   - *Step 2 (Fail Path):* Attach debugger or trace code path and enumerate control knobs. Probe with tagged logs (`[DBG-xxxx]`).
   - *Step 3 (Falsify):* Formulate 3-5 hypotheses and run disproofs first.
   - *Step 4 (Breadcrumb Ledger):* Record every experiment run, observation, and ruled-in/out result.
2. **Post-Mortem Record:**
   - After root-cause fix passes validation, generate the engineering artifact via `/post-mortem` (Summary, Symptom, Root Cause, Fix, Validation, Action items). Blameless tone.

---

## 3. Code Review & Sanity Audit Rules (Pathway 3)

When reviewing plans, pull requests, or existing codebase modules:
1. Run `/scrutinize` first to challenge whether the code should exist at all and walk the active call graph.
2. Run `/code-review` to enforce Fowler code smells and documented repo standards.

---

## 4. Todolist Code Quality & Constraints

- **Strict Typing:** TypeScript strict mode; `any` is forbidden.
- **YAGNI:** Deletion over addition. Smallest working diff wins. No boilerplate or scaffolding for speculative futures.
- **Accessibility (A11y):** Touch targets min 44x44px, WCAG contrast 4.5:1, keyboard navigation (`Tab`, `Enter`, `Escape`), semantic HTML elements (`main`, `nav`, `button`).
- **Dependencies:** Use platform standards (Web APIs, native elements) first. Do not add external dependencies without explicit user consent.
