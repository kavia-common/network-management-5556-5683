/* jest-dom adds custom jest matchers for asserting on DOM nodes.
   allows you to do things like:
   expect(element).toHaveTextContent(/react/i)
   learn more: https://github.com/testing-library/jest-dom
*/
import '@testing-library/jest-dom';

// Provide a global fetch in Jest if not present (some tests mock it themselves)
if (typeof global.fetch === 'undefined') {
  // whatwg-fetch works in JSDOM and is commonly used with CRA
  // eslint-disable-next-line global-require
  require('whatwg-fetch');
}
