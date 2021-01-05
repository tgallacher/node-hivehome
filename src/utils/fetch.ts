/**
 * @packageDocumentation
 * @hidden
 */
import nodefetch from 'node-fetch';
import merge from 'lodash.merge';

/**
 * Native fetch with basic HTTP error handling.
 */
export const fetch = async (
  url: string,
  options: Partial<RequestInit> = {}
) => {
  const reqOpts = merge(
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
    options
  );

  const resp = await nodefetch(url, reqOpts);

  if (resp.status > 399) {
    throw new Error(`Request Error (code: ${resp.status}): ${resp.statusText}`);
  }

  return resp.json();
};
