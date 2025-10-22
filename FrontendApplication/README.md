# Network Devices Frontend (React)

A responsive and accessible React UI for managing network devices. Users can create, view, edit, delete, search, filter, and sort devices, view device details, and refresh status. The app reads the backend API base URL from environment variables and supports an optional mock mode for local UI testing.

## Features

- CRUD for devices (name, ip, type, location, status)
- Devices list with search, filter (type/status), sort (name/ip/type/location/status), and pagination
- Device detail page with status indicator and refresh (ping) action
- Accessible forms with validation (required fields, IP format), ARIA attributes, keyboard navigation
- Global success/error toasts
- Responsive layout with cohesive styling and compact table mode on small screens
- Environment-configured API base URL with optional mock mode

## Quick Start

1. Install dependencies
   npm install

2. Configure environment
   - Copy `.env.example` to `.env` and update values as needed.
   - For Create React App (CRA), typical local setup if frontend runs on 3000 and backend on 3001:
     - REACT_APP_API_BASE_URL=http://localhost:3001
     - REACT_APP_USE_MOCKS=false (set true to use in-memory mocks)
     - REACT_APP_PAGINATION_PAGE_SIZE_DEFAULT=10

3. Start the app
   npm start

   Open http://localhost:3000

Preview links:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Backend API docs (Swagger UI): http://localhost:3001/docs

## Environment Variables

- REACT_APP_API_BASE_URL
  - Base URL for the backend API (e.g., http://localhost:3001).
  - If omitted, requests are made relative to the current origin (useful if CRA proxy is configured).
- REACT_APP_USE_MOCKS
  - When "true", the app uses an in-memory mock API instead of calling the backend.
  - Useful for UI-only development without a running backend.
- REACT_APP_PAGINATION_PAGE_SIZE_DEFAULT
  - Integer default page size for the devices list pagination UI. Defaults to 10 if unset.

A sample configuration is provided in .env.example.

If you migrate to Vite later, use VITE_API_BASE_URL, VITE_USE_MOCKS, and VITE_PAGINATION_PAGE_SIZE_DEFAULT.

## Verifying Connectivity

- Start backend on port 3001 (ensure Mongo is reachable and MONGO_URI is set).
- Start frontend on port 3000 with `REACT_APP_API_BASE_URL=http://localhost:3001`.
- Navigate to /devices:
  - If the database is empty, create a new device via the UI.
  - Check that list, detail, edit, delete, and "Refresh Status" work.
- If you prefer to test UI only, set `REACT_APP_USE_MOCKS=true` and restart the frontend; API calls will be mocked in-memory.

## Backend Compatibility Notes

- Pagination contract (server-side):
  - GET /devices supports query params: ?page=<int>&limit=<int>
  - Response shape must be:
    { items: Device[], total: number, page: number, limit: number }
- Client fallback:
  - If the backend returns a plain array, the frontend will compute pagination client-side while keeping the UI consistent.
- ID mapping:
  - The frontend maps device identifiers from either id or _id to id uniformly.

## API Endpoints (expected)

- GET /devices
- GET /devices/:id
- POST /devices
- PUT /devices/:id
- DELETE /devices/:id
- POST /devices/:id/ping (optional) — triggers status refresh

## Pages/Routes

- /devices — Devices list (search/filter/sort, pagination, create link)
- /devices/new — Create device form
- /devices/:id — Device detail with status refresh
- /devices/:id/edit — Edit device form

## Accessibility

- Proper labels, roles, aria-live regions for toasts, form errors, and pagination status
- Keyboard focus outlines and navigation
- Semantic HTML, responsive compact table with truncated columns and tooltips
- Sufficient color contrast and visible focus indicators

## Development Notes

- Mock API is implemented under src/api/devices.js and enabled via REACT_APP_USE_MOCKS=true.
- The API client reads REACT_APP_API_BASE_URL if set, otherwise uses same-origin relative paths.
- Validation utilities live in src/utils/validation.js.
- Pagination component lives at src/components/Common/Pagination.js and can be reused in other lists.

## Scripts

- npm start — start development server
- npm test — run tests
- npm run build — production build

## License

MIT
