# Frontend README

The frontend is a React app built with Vite and TypeScript. It renders movie and TV discovery pages and consumes data from the backend API.

## Run Frontend

From the repository root:

```bash
npm run dev:client
```

Default client URL:

- http://localhost:5173

During development, API calls to /api are proxied to the backend server.

For backend endpoint details, see the live docs at:

- [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

## Frontend Structure

Main frontend modules are in src/front-end:

- App.tsx - app-level routing and layout composition
- main.tsx - app bootstrap
- pages - feature pages for movie and TV lists/details
- components - shared and feature UI components
- services - API service calls used by pages/components
- api-schemas.ts (from ../back-end) - shared frontend/backend domain types

## Related Backend Docs

For backend endpoints and API documentation routes, see:

- [Backend README](../back-end/README.md)
