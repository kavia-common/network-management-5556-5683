Integration tests for React UI using React Testing Library.

- Location: tests/integration
- How: We render <App /> inside a MemoryRouter and mock global.fetch to simulate backend responses at the network boundary.
- Flows covered:
  - list → create → edit → delete → ping
  - duplicate IP (409) error surfaced to the user

Run:
  npm test  -- --watchAll=false
