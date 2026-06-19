# Copilot instructions for `themoviedb-discovery-app`

## Build, test, and lint commands

- **Node version:** `22.x` (`.nvmrc` is `22`)
- Install dependencies: `npm ci`
- Run full app in dev (backend + frontend): `npm run dev`
- Run frontend only: `npm run dev:client` (Vite on `http://localhost:5173`)
- Run backend only: `npm run dev:server` (Express on `http://localhost:3001`)
- Lint: `npm run lint`
- Unit tests (frontend + backend): `npm test`
- Run one unit test file: `npx vitest run src/back-end/movies.test.ts`
- Run one unit test by name: `npx vitest run src/front-end/App.test.tsx -t "renders tv list route"`
- Build frontend bundle: `npm run build:client`
- Build backend bundle: `npm run build:server`
- Build production artifacts: `npm run build:prod`
- E2E tests: `npm run e2e`
- Run one E2E spec: `npx playwright test e2e/movies.spec.ts`

## High-level architecture

- This repo is a single Node/TypeScript project containing:
  - a Vite + React frontend in `src/front-end`
  - an Express backend in `src/back-end`
- Backend entrypoint is `src/back-end/index.ts`. It wires middleware and registers route modules (`registerHealthApi`, `registerMoviesApi`, `registerTvApi`) plus API docs (`registerApiSpec`).
- API contract is centralized in `src/back-end/api-schemas.ts` using Zod schemas + inferred TS types. These types are imported directly by frontend pages/services (for example `../../../back-end/api-schemas`), so schema changes affect both sides.
- OpenAPI is generated from those Zod schemas in `src/back-end/api-spec.ts` using `@asteasolutions/zod-to-openapi`, then exposed at:
  - `/openapi.json`
  - `/api/docs` (Swagger UI)
- Frontend routing is in `src/front-end/App.tsx` (movies list/details, movie stats, TV list/details). Data access stays in `src/front-end/services/*`.
- Frontend service calls use relative `/api/...` URLs; Vite proxies `/api` to backend `http://localhost:3001` in `vite.config.ts`.
- Movie stats (`MovieStatsPage`) is computed client-side by combining multiple pages of popular movies with genres (`fetchPopularMoviesPages` + `fetchMovieGenres`).

## Key conventions in this codebase

- **Language/region defaults are intentional:** both backend and frontend default to `language=fr-FR` and `region=FR` for popular lists.
- **TMDB key handling is centralized:** backend endpoints call `getRequiredTmdbApiKey(res)` from `src/back-end/utils.ts` and support either `TMDB_API_KEY` or `VITE_TMDB_API_KEY`.
- **Query param normalization uses shared helper:** use `getSingleQueryParam` when reading request query values in backend handlers.
- **Backend error shape/passthrough pattern:**
  - Upstream TMDB non-OK responses return the same status with `{ error, details }`
  - Local runtime failures return `500` with `{ error }`
- **Route module pattern:** add backend endpoints in dedicated `registerXApi(app)` modules, then register them in `index.ts`.
- **Keep service endpoint inventory in sync:** `/` response uses `serviceEndpoints` from `api-schemas.ts`; update this list when adding/removing public endpoints.
- **Tests are contract- and behavior-focused with mocks:**
  - Backend tests mock `fetch` and Express `app.get` handlers rather than launching a real server.
  - Frontend service tests stub `fetch` and assert exact API URLs.
  - Router tests use `MemoryRouter`.
  - E2E tests in `e2e/` mock API responses with `page.route(...)` and do not depend on live TMDB.


## Commit message guideline

- Follow the Conventional Commits format: `<type>(<optional-scope>): <description>`.
- Use lowercase commit types such as `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, and `ci`.
- Keep the subject concise and imperative (for example: `feat(front-end): add movie genre filter`).
