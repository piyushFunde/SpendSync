# SpendSync project structure

## Classification

**Full-stack application**, arranged as a single repository with separate `client/` and `server/` applications. It is not a multi-module build: the frontend is built with npm/Vite and the backend with Maven.

## Top-level modules

| Module | Role | Entry point |
|---|---|---|
| `client/` | React single-page application | `client/src/main.jsx` mounts `App`; `client/index.html` provides `#root` |
| `server/` | Spring Boot REST API and scheduled mail job | `server/src/main/java/com/spendsync/api/SpendSyncApplication.java` |

## Frontend layers and source counts

Counts are from `client/src` and exclude `node_modules/`, `dist/`, and public assets.

| Layer / directory | Files | Responsibilities |
|---|---:|---|
| `client/src/` | 4 | Root router/layout (`App.jsx`), React entry (`main.jsx`), global and app CSS |
| `client/src/pages/` | 7 | Landing, login, registration, dashboard, transactions, analytics, settings |
| `client/src/components/` | 5 | Auth guard, header, sidebar, transaction item and transaction modal |
| `client/src/store/` | 2 | Zustand auth and transaction state |
| `client/src/api/` | 1 | Axios client and REST API methods |
| `client/src/utils/` | 2 | Categories/formatting and PDF statement generation |
| `client/src/assets/` | 3 | SVG and image assets |
| **Total** | **24** | |

The principal flow is page → Zustand store → Axios client → REST API. `App.jsx` declares the browser routes and wraps protected pages with `ProtectedRoute` and the authenticated layout.

## Backend layers and source counts

Counts are from `server/src/main/java`.

| Layer / package | Files | Responsibilities |
|---|---:|---|
| `com.spendsync.api` | 1 | Spring Boot entry point and scheduling activation |
| `config` | 1 | Spring Security, CORS, authentication and password encoder beans |
| `controller` | 2 | Authentication and transaction REST endpoints |
| `dto.request` | 3 | Login, registration and transaction request validation |
| `dto.response` | 3 | Authentication, transaction and dashboard response shapes |
| `exception` | 3 | Domain exceptions and global REST error mapping |
| `model` | 2 | MongoDB User and Transaction documents |
| `repository` | 2 | Spring Data MongoDB repositories |
| `security` | 3 | User lookup, JWT generation/validation and request filtering |
| `service` | 3 | Authentication, transaction operations/aggregation and scheduled email reports |
| **Total** | **23** | |

The backend follows controller → service → repository → MongoDB layering. The scheduled report service also reads users and transactions through the repositories and sends mail through Spring Mail.

## Browser routes

Declared in `client/src/App.jsx`:

| Route | Access | Page |
|---|---|---|
| `/` | Public | Landing |
| `/login` | Public | Login |
| `/register` | Public | Registration |
| `/dashboard` | Protected | Dashboard |
| `/transactions` | Protected | Transactions |
| `/analytics` | Protected | Analytics |
| `/settings` | Protected | Settings |
| `*` | Public fallback | Redirect to `/` |

## Backend entry points

- `POST /api/auth/register` and `POST /api/auth/login` are public.
- `/api/transactions` exposes authenticated create, list/filter, read-by-ID, update, delete, dashboard-summary and CSV-export operations.
- `EmailReportService.sendMonthlyReports` runs on the first day of each month at 09:00 according to its Spring cron expression.

## Configuration and build files

- `client/package.json`: frontend scripts and npm dependency ranges.
- `client/vite.config.js`: React/Tailwind Vite plugins and development proxy for `/api` to `http://localhost:8080`.
- `client/index.html`: SPA root, page metadata, web manifest and `main.jsx` entry.
- `client/public/manifest.json`: installable web-app metadata.
- `server/pom.xml`: Spring Boot parent, Java version, Maven dependencies and Spring Boot packaging plugin.
- `server/src/main/resources/application.yml`: MongoDB, mail, port, JWT, CORS and logging configuration.
- `.env.example`: sample names/defaults for backend and frontend environment variables.

## Functional areas

1. Public landing and account onboarding.
2. Authentication and JWT-protected access.
3. Personal transaction ledger, filtering, and CSV/PDF exports.
4. Dashboard summaries and financial analytics.
5. Local user display preferences and settings.
6. Scheduled monthly email summaries.

