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
   - For Create React App:
     - REACT_APP_API_BASE_URL=http://localhost:5000
     - REACT_APP_USE_MOCKS=false (or true to use in-memory mocks)
     - REACT_APP_PAGINATION_PAGE_SIZE_DEFAULT=10

3. Start the app
   npm start

   Open http://localhost:3000

## Environment Variables

- REACT_APP_API_BASE_URL
  - Base URL for the backend API, e.g., http://localhost:5000
- REACT_APP_USE_MOCKS
  - When "true", the app uses an in-memory mock API instead of calling the backend
- REACT_APP_PAGINATION_PAGE_SIZE_DEFAULT
  - Integer default page size for the devices list pagination UI. Defaults to 10 if unset.

If you migrate to Vite later, use VITE_API_BASE_URL, VITE_USE_MOCKS, and VITE_PAGINATION_PAGE_SIZE_DEFAULT.

## API Endpoints (expected)

- GET /devices
- GET /devices/:id
- POST /devices
- PUT /devices/:id
- DELETE /devices/:id
- POST /devices/:id/ping (optional) — triggers status refresh

### Pagination contract

If backend supports pagination on GET /devices, it should accept:
- Query params: ?page=<int>&limit=<int>
- Response shape: { items: Device[], total: number, page: number, limit: number }

If backend pagination is not available, the frontend automatically falls back to client-side pagination by fetching the full list and slicing in-memory. The UI remains consistent in both modes.

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
- The API client reads process.env.REACT_APP_API_BASE_URL by default.
- Validation utilities live in src/utils/validation.js.
- Pagination component lives at src/components/Common/Pagination.js and can be reused in other lists.

## Scripts

- npm start — start development server
- npm test — run tests
- npm run build — production build

## License

MIT
