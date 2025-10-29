# Network Management Frontend (React)

This workspace hosts the React Frontend Application for managing network devices.

Quick links:
- Local preview (dev server): http://localhost:3000
- Backend API (expected): http://localhost:3001
- Backend API docs (Swagger UI): http://localhost:3001/docs

## Getting Started

1) Install dependencies
   cd FrontendApplication
   npm install

2) Configure environment
   - Preferred: set FrontendApplication/.env.development.local with REACT_APP_API_BASE_URL pointing to your backend preview origin.
   - Alternatively, copy FrontendApplication/.env.example to FrontendApplication/.env and adjust values as needed:
     REACT_APP_API_BASE_URL=http://localhost:3001
     REACT_APP_USE_MOCKS=false
     REACT_APP_PAGINATION_PAGE_SIZE_DEFAULT=10

3) Start the app
   npm start
   Then open http://localhost:3000

## Environment Variables

- REACT_APP_API_BASE_URL
  Base URL for the backend API (e.g., http://localhost:3001). If omitted, fetch uses same-origin relative paths.
  For HTTPS previews, set this to the matching HTTPS backend origin at the same host (e.g.,
  https://vscode-internal-26250-beta.beta01.cloud.kavia.ai:3001) to avoid mixed-content/network errors.
  After changing .env, restart the frontend preview (stop/start) so the new env is picked up.
  IMPORTANT for HTTPS previews: when the frontend origin is HTTPS (for example,
  https://vscode-internal-26250-beta.beta01.cloud.kavia.ai:3000), set this to the exact HTTPS backend origin, typically
  https://vscode-internal-26250-beta.beta01.cloud.kavia.ai:3001. This prevents mixed-content and blocked network requests.

- REACT_APP_USE_MOCKS
  When "true", an in-memory mock API is used; no backend required. Useful for UI-only development.

- REACT_APP_PAGINATION_PAGE_SIZE_DEFAULT
  Default page size for pagination (integer). Defaults to 10 if unset.

A sample is provided in FrontendApplication/.env.example.

## HTTPS/CORS Alignment

When running over HTTPS:
- Set FrontendApplication/.env REACT_APP_API_BASE_URL to the HTTPS backend origin at the same host, e.g.:
  https://vscode-internal-26250-beta.beta01.cloud.kavia.ai:3001
- Ensure backend CORS allowlist includes the exact HTTPS frontend origin:
  https://vscode-internal-26250-beta.beta01.cloud.kavia.ai:3000
- Restart the frontend preview after changing .env.
- Verify with:
  - GET https://vscode-internal-26250-beta.beta01.cloud.kavia.ai:3001/health/db
  - GET https://vscode-internal-26250-beta.beta01.cloud.kavia.ai:3001/devices

## Backend Endpoints Expected

- GET /devices
- POST /devices
- GET /devices/:id
- PUT /devices/:id
- DELETE /devices/:id
- POST /devices/:id/ping
- GET / (health)

OpenAPI docs should be visible at http://localhost:3001/docs.

For more detailed frontend documentation, see FrontendApplication/README.md
