import { http, getBaseURL } from '../../../src/api/client';

describe('api client', () => {
  beforeEach(() => {
    // Reset env var between tests
    process.env.REACT_APP_API_BASE_URL = '';
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('resolves base URL from env and performs fetch', async () => {
    process.env.REACT_APP_API_BASE_URL = 'http://localhost:3001/';
    global.fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: true }),
    });

    const res = await http.request('/health', { method: 'GET' });
    expect(getBaseURL()).toEqual('http://localhost:3001');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/health',
      expect.objectContaining({ method: 'GET' })
    );
    expect(res).toEqual({ ok: true });
  });

  test('handles error response', async () => {
    process.env.REACT_APP_API_BASE_URL = 'http://localhost:3001';
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: { get: () => 'application/json' },
      json: async () => ({ message: 'oops' }),
    });

    await expect(http.request('/x', { method: 'GET' })).rejects.toThrow(/oops|Bad Request/);
  });
});
