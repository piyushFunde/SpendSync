# SpendSync technology stack

This is a source inventory of the current stack; it does not select or recommend a target stack.

## Languages and runtime requirements

- Frontend source is JavaScript with JSX, using native ES modules. `client/package.json` declares `"type": "module"`. No TypeScript compiler configuration was found.
- Frontend runtime/build requirement is not explicitly pinned in `package.json`; the README says Node.js 18+, which may not match the currently declared Vite version's runtime requirements.
- Backend source is Java; `server/pom.xml` sets `java.version` to 17.
- Backend build is Maven. The README documents Maven 3.8+ and Maven Wrapper commands, but the inspected project file inventory did not show a wrapper in `server/`.

## Frontend frameworks and libraries

Versions below are declared ranges from `client/package.json` (a leading `^` is the package's semver range, not a resolved lockfile version).

| Package | Declared version |
|---|---:|
| `react` | `^19.3.1` |
| `react-dom` | `^19.3.1` |
| `react-router-dom` | `^7.18.5` |
| `vite` | `^8.3.5` |
| `@vitejs/plugin-react` | `^6.1.2` |
| `tailwindcss` | `^4.3.3` |
| `@tailwindcss/vite` | `^4.3.3` |
| `axios` | `^1.21.0` |
| `zustand` | `^5.0.16` |
| `recharts` | `^3.10.1` |
| `date-fns` | `^4.4.0` |
| `lucide-react` | `^1.65.0` |
| `react-hot-toast` | `^2.6.1` |
| `react-csv` | `^2.2.2` |
| `jspdf` | `^4.2.1` |
| `jspdf-autotable` | `^5.0.9` |
| `oxlint` (development) | `^1.89.0` |
| `@types/react` (development) | `^19.3.0` |
| `@types/react-dom` (development) | `^19.3.0` |

The frontend scripts are `dev`, `build`, `lint`, and `preview`. Vite is configured with the React and Tailwind CSS plugins.

## Backend frameworks and libraries

- Spring Boot parent: `3.2.5`
- Java: `17`
- Spring Boot starters (versions managed by the parent): Web, Data MongoDB, Security, Validation, Mail, and Test.
- Spring Security test starter (test scope; version managed by Boot).
- JJWT: `0.12.5` (`jjwt-api`, plus runtime `jjwt-impl` and `jjwt-jackson`).
- Apache Commons CSV: `1.10.0`.
- Lombok: version managed by the Spring Boot parent.
- Maven plugin: Spring Boot Maven plugin; version managed by the parent.

No separate lockfile or effective Maven dependency report was used, so versions not explicitly declared in the manifest are not expanded here.

## Runtime integrations and configuration

- MongoDB via Spring Data MongoDB. URI key: `spring.data.mongodb.uri` (`MONGODB_URI`).
- SMTP via Spring Mail. Keys: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`.
- JWT secret and expiration: `JWT_SECRET`, `JWT_EXPIRATION_MS`.
- Backend port: `PORT`.
- CORS origins: `ALLOWED_ORIGINS`.
- Frontend uses a same-origin `/api` Axios base URL; Vite's development proxy points to localhost port 8080. `.env.example` also lists `VITE_API_BASE_URL`, but the inspected Axios client does not read it.
- Authentication uses stateless Spring Security and bearer JWTs.
- Scheduled email work is activated by `@EnableScheduling`; a monthly task uses a cron expression in `EmailReportService`.

## Documentation/source discrepancies

- README describes React 18 and React Router v6, while the current package manifest declares React 19.3.1 and React Router 7.18.5.
- README describes monthly report delivery via Nodemailer; the backend implements the mail integration using Spring Mail / `JavaMailSender`.
- The package manifest's declared versions are substantially newer than the README's stack description. No deprecated or end-of-life status is asserted here because no dependency lifecycle scan was performed.

