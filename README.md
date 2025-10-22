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
   - Copy FrontendApplication/.env.example to FrontendApplication/.env
   - Adjust values as needed:
     REACT_APP_API_BASE_URL=http://localhost:3001
     REACT_APP_USE_MOCKS=false
     REACT_APP_PAGINATION_PAGE_SIZE_DEFAULT=10

3) Start the app
   npm start
   Then open http://localhost:3000

## Environment Variables

- REACT_APP_API_BASE_URL
  Base URL for the backend API (e.g., http://localhost:3001). If omitted, fetch uses same-origin relative paths.

- REACT_APP_USE_MOCKS
  When "true", an in-memory mock API is used; no backend required. Useful for UI-only development.

- REACT_APP_PAGINATION_PAGE_SIZE_DEFAULT
  Default page size for pagination (integer). Defaults to 10 if unset.

A sample is provided in FrontendApplication/.env.example.

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