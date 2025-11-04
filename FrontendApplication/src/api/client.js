 /**
  * Resolve API base URL from environment.
  * - Primary: REACT_APP_API_BASE_URL (Create React App). If migrating to Vite, use VITE_BACKEND_API_BASE or VITE_API_BASE_URL.
  * - Supports full HTTPS/HTTP origins (e.g., https://host:3001) to avoid mixed-content with HTTPS frontends.
  * - Fallbacks (only if env is unset/empty):
  *    - If frontend runs at localhost:3000, default to http://localhost:3001 (backend dev port)
  *    - Otherwise use same-origin (empty string -> relative paths)
  * Notes:
  *    - We normalize trailing slashes and ensure http(s) scheme is present when absolute.
  */
 /**
  * PUBLIC_INTERFACE
  * Environment configuration:
  * - Reads process.env.REACT_APP_API_BASE_URL for the backend origin.
  * - Trailing slashes are stripped; bare localhost:3001 will be normalized to http://localhost:3001.
  */
 const rawEnvBase = (process.env.REACT_APP_API_BASE_URL && process.env.REACT_APP_API_BASE_URL.trim())
   ? process.env.REACT_APP_API_BASE_URL.trim()
   : '';
 
 function normalizeBaseUrl(url) {
   if (!url) return '';
   // If it's a bare host without protocol, assume http
   if (/^localhost:\d+$/i.test(url)) {
     return `http://${url}`;
   }
   // Add protocol if missing but domain present (e.g., localhost)
   if (/^localhost$/i.test(url)) {
     return 'http://localhost:3001';
   }
   // strip trailing slashes
   return url.replace(/\/+$/, '');
 }
 
 const isLocalDev3000 = typeof window !== 'undefined'
   && window.location
   && typeof window.location.origin === 'string'
   && /localhost:3000$/i.test(window.location.host);
 
 // Env should take absolute precedence when set and non-empty
 const envBase = normalizeBaseUrl(rawEnvBase);
 const resolvedBaseURL = envBase || (isLocalDev3000 ? 'http://localhost:3001' : '');
 
 // Development-only visibility to verify the chosen base URL
 if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
   // eslint-disable-next-line no-console
   console.info(`[DEV] API Base URL resolved to: ${resolvedBaseURL || 'same-origin'}`);
   try {
     const mocks = String(process.env.REACT_APP_USE_MOCKS || '').toLowerCase() === 'true';
     // eslint-disable-next-line no-console
     console.info(`[DEV] API Mock mode: ${mocks ? 'ENABLED' : 'disabled'}`);
   } catch (e) {
     // ignore
   }
 }
 
 /**
  * Minimal client wrapper around fetch with JSON handling and base URL.
  * If resolvedBaseURL is empty, uses same-origin relative paths.
  * Preserves backend pagination shape compatibility and error propagation.
  */
 async function request(path, options = {}) {
   // Ensure path formatting and safe URL concatenation
   const normalizedPath = path.startsWith('/') ? path : `/${path}`;
   const base = resolvedBaseURL ? resolvedBaseURL.replace(/\/+$/, '') : ''; // strip trailing slash when present
   const url = base ? `${base}${normalizedPath}` : normalizedPath;
 
   // Default to omit credentials to avoid unexpected CORS failures if backend does not allow cookies
   const { credentials = 'omit' } = options;
 
   const headers = {
     'Content-Type': 'application/json',
     ...(options.headers || {}),
   };
 
   let res;
   try {
     res = await fetch(url, { ...options, headers, credentials, mode: base ? 'cors' : 'same-origin' });
   } catch (networkErr) {
     // Helpful guidance to surface CORS/DNS/base URL problems
     // eslint-disable-next-line no-console
     console.error(
       '[Network Error] Failed to reach backend.',
       {
         url,
         base: resolvedBaseURL || 'same-origin',
         hint: 'Check REACT_APP_API_BASE_URL, backend availability, and CORS configuration. If running locally, ensure backend listens on http://localhost:3001 and has CORS enabled.',
         originalError: networkErr?.message || networkErr
       }
     );
     const err = new Error('Network error contacting API. See console for details.');
     err.cause = networkErr;
     throw err;
   }
 
   const contentType = res.headers.get('content-type') || '';
   let data = null;
 
   if (contentType.includes('application/json')) {
     data = await res.json().catch(() => null);
   } else {
     data = await res.text().catch(() => null);
   }
 
   if (!res.ok) {
     const message = (data && (data.message || data.error)) || res.statusText || 'Request failed';
     const err = new Error(message);
     err.status = res.status;
     err.data = data;
     // eslint-disable-next-line no-console
     console.error('[API Error]', { url, status: res.status, message, data });
     throw err;
   }
   return data;
 }
 
 // PUBLIC_INTERFACE
 export function getBaseURL() {
   /** Returns the configured API base URL (from env or fallback). */
   return resolvedBaseURL;
 }
 
 // PUBLIC_INTERFACE
 export function getUseMocks() {
   /** Returns whether mock mode is enabled (from env). Defaults to false. */
   return String(process.env.REACT_APP_USE_MOCKS || '').toLowerCase() === 'true';
 }
 
 // PUBLIC_INTERFACE
 export const http = { request };
