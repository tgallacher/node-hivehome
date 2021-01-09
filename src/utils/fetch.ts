/**
 * @packageDocumentation
 * @hidden
 */
import nodefetch from 'node-fetch';
import merge from 'lodash.merge';

/**
 * Native fetch with basic HTTP error handling.
 */
export const fetch = async <T>(
  url: string,
  options: Partial<RequestInit> = {},
): Promise<T | T[]> => {
  const reqOpts = merge(
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
    options,
  );

  const resp = await nodefetch(url, reqOpts);

  if (resp.status > 399) {
    throw new Error(`Request Error (code: ${resp.status}): ${resp.statusText}`);
  }

  return resp.json();
};
