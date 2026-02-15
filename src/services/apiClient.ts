/**
 * @module services/apiClient
 * @description Generic HTTP client for making REST API requests.
 * Provides a typed wrapper around the Fetch API with JSON serialization.
 */

import { API_URL } from '@/config/constants';

/** Options for configuring an API request. */
type RequestOptions = {
  /** HTTP method (defaults to `GET`). */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Request body (will be JSON-serialized). */
  body?: unknown;
  /** Additional HTTP headers. */
  headers?: Record<string, string>;
};

/**
 * Makes an HTTP request to the backend API.
 *
 * Automatically sets `Content-Type: application/json` and serializes the body.
 * Throws an `Error` if the response is not OK (status >= 400).
 *
 * @typeParam T - Expected response type.
 * @param path - API path (appended to `API_URL`).
 * @param options - Optional request configuration.
 * @returns Parsed JSON response of type `T`.
 * @throws {Error} If the response status is not OK.
 *
 * @example
 * const users = await apiRequest<User[]>('/users');
 * await apiRequest('/users', { method: 'POST', body: { name: 'John' } });
 */
export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {}
) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  return response.json() as Promise<T>;
};
