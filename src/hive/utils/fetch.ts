import fetch from 'node-fetch';

const fetchWrapper = async (
  url: string,
  options: Partial<RequestInit> = {}
) => {
  const resp = await fetch(url, {
    ...options,
    // FIXME
    // @ts-ignore
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (resp.status > 399) {
    throw new Error(`Request Error (code: ${resp.status}): ${resp.statusText}`);
  }

  return resp.json();
};

export const post = async (
  url: string,
  body: Partial<Record<string, unknown>>,
  options?: Partial<RequestInit>
) => {
  try {
    return fetchWrapper(url, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

export const get = async (url: string, options?: Partial<RequestInit>) => {
  try {
    return fetchWrapper(url, options);
  } catch (error) {
    throw new Error(error.message);
  }
};
