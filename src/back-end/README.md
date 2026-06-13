# Backend README

This backend is an Express server that proxies requests to TMDb and exposes app-focused endpoints for movies, TV shows, health checks, and API documentation.

## Run Backend

From the repository root:

```bash
npm run dev:server
```

Default server URL:

- http://localhost:3001

## Environment Variables

Set one of the following variables so backend requests to TMDb are authenticated:

- `TMDB_API_KEY`
- `VITE_TMDB_API_KEY`

## Endpoints

### Service and Documentation

- `GET /`
  - Returns service metadata and useful links.
- `GET /api/health`
  - Returns `{ "status": "ok" }`.
- `GET /openapi.json`
  - Returns OpenAPI 3.1 JSON.
- `GET /api/docs`
  - Swagger UI for the API.

### Movies

- `GET /api/movies/popular`
  - Query params: `language`, `region`, `page`
- `GET /api/movies/:id`
  - Query params: `language`

### TV Shows

- `GET /api/tv/popular`
  - Query params: `language`, `region`, `page`
- `GET /api/tv/:id`
  - Query params: `language`

## Backend Structure

Main backend modules are in `src/back-end`:

- `index.ts` - bootstrap and route registration
- `api-spec.ts` - OpenAPI document generation and docs route registration
- `api-schemas.ts` - shared Zod schemas and inferred API contract types
- `health-api.ts` - health endpoint registration
- `movies-api.ts` - movies endpoints
- `tv-api.ts` - TV endpoints
- `utils.ts` - shared backend helpers
