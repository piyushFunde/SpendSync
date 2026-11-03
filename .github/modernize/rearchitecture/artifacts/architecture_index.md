# SpendSync architecture implementation guide

This index is not the full contract. Do not implement from this file alone; follow the artifact paths below.

## Analysis scope

This is a source-based architecture analysis, not a migration request. No target stack or acceptance criteria for rewriting were supplied, so there is no `migration_boundary.yaml`. No partial-migration cut was declared or required by this analysis; therefore no `seams.yaml` is emitted.

## Global artifacts

- `unit_graph.yaml`
  - Who reads: all implementation workers and design.
  - Use for: externally triggered units, source anchors, dependencies, public signatures, dynamic entrypoints and per-unit shared refs.
  - How to consume: locate the assigned unit; source anchors identify evidence, not rewrite scope.
- `wire_contracts.yaml`
  - Who reads: workers touching APIs or integrations.
  - Use for: current HTTP methods, paths, request/response shapes, auth and errors.
  - How to consume: filter `contracts` by `unit`; retain current documented contracts unless the user changes them.
- `shared_modules.yaml`
  - Who reads: workers whose unit uses shared modules.
  - Use for: cross-unit stores, repositories, documents, shared UI and the allowed field/method inventory.
  - How to consume: filter `modules` by `used_by_units`; each unit's `shared_refs[].used_fields` is a subset of the module field list.
- `cross_unit_state.yaml`
  - Who reads: workers touching authentication or local/demo transaction state.
  - Use for: browser token and offline/demo state flows.
  - How to consume: filter `flows` where `writer.unit` or `reader.unit` matches the assigned unit; honor `must_confirm: runtime`.
- `project-structure.md`
  - Who reads: design and planning.
  - Use for: project type, layers, entrypoints, file counts and config roles.
- `tech-stack.md`
  - Who reads: design, planning and implementation.
  - Use for: observed language, framework, dependency and runtime facts.
- `data-model.md`
  - Who reads: workers changing persistence or data contracts.
  - Use for: existing MongoDB collections, fields, indexes and ownership representation.

## Implementation Guide

Each listed page/API/job is an analysis unit. Before implementation, read its per-unit behavior, bindings and decomposition artifacts, then filter the global artifacts above for that unit.

### Frontend pages

| Unit / external trigger | Required per-unit artifacts |
|---|---|
| `landing-page` — browser route `/` | `units/landing-page/behavior.yaml`; `units/landing-page/bindings.yaml`; `units/landing-page/unit_decomposition.yaml` |
| `login-page` — browser route `/login` | `units/login-page/behavior.yaml`; `units/login-page/bindings.yaml`; `units/login-page/unit_decomposition.yaml` |
| `register-page` — browser route `/register` | `units/register-page/behavior.yaml`; `units/register-page/bindings.yaml`; `units/register-page/unit_decomposition.yaml` |
| `dashboard-page` — protected browser route `/dashboard` | `units/dashboard-page/behavior.yaml`; `units/dashboard-page/bindings.yaml`; `units/dashboard-page/unit_decomposition.yaml` |
| `transactions-page` — protected browser route `/transactions` | `units/transactions-page/behavior.yaml`; `units/transactions-page/bindings.yaml`; `units/transactions-page/unit_decomposition.yaml` |
| `analytics-page` — protected browser route `/analytics` | `units/analytics-page/behavior.yaml`; `units/analytics-page/bindings.yaml`; `units/analytics-page/unit_decomposition.yaml` |
| `settings-page` — protected browser route `/settings` | `units/settings-page/behavior.yaml`; `units/settings-page/bindings.yaml`; `units/settings-page/unit_decomposition.yaml` |

For these units, read behavior for observable UI states, side effects and validation; bindings for React Router routes and client wiring; decomposition only for advisory split candidates. Filter shared modules, wire contracts and cross-unit flows by the assigned unit. The global route table and auth guard are in `browser-route-config` and `auth-store`.

### Backend units

| Unit / external trigger | Required per-unit artifacts |
|---|---|
| `auth-api` — `POST /api/auth/register`, `POST /api/auth/login` | `units/auth-api/behavior.yaml`; `units/auth-api/bindings.yaml`; `units/auth-api/unit_decomposition.yaml` |
| `transaction-api` — authenticated `/api/transactions` resource | `units/transaction-api/behavior.yaml`; `units/transaction-api/bindings.yaml`; `units/transaction-api/unit_decomposition.yaml` |
| `monthly-report-job` — scheduled monthly mail job | `units/monthly-report-job/behavior.yaml`; `units/monthly-report-job/bindings.yaml`; `units/monthly-report-job/unit_decomposition.yaml` |

For API units, read behavior for side effects, branches, error contracts and security assumptions; bindings for Spring routes, validation, security and runtime configuration. Filter `wire_contracts.yaml` by unit and shared modules by `used_by_units`. The scheduled unit uses the cross-cutting mail configuration and repository/document rows.

## Completion evidence

Before reporting implementation complete, provide the artifact paths read, each implemented `must_preserve` item, unresolved/deferred contracts, and relevant test/build/runtime evidence. Candidate splits are advisory (`commit: false`); they do not establish a target design.
