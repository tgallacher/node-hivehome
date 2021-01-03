import fetch from 'node-fetch';

export class HiveFetch {
  static async get(url: string, options?: Partial<RequestInit>) {
    return HiveFetch.fetch(url, options);
  }

  static async post(
    url: string,
    body: Partial<Record<string, unknown>>,
    options?: Partial<RequestInit>
  ) {
    return HiveFetch.fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  }

  static async fetch(url: string, options: Partial<RequestInit> = {}) {
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
      throw new Error(
        `Request Error (code: ${resp.status}): ${resp.statusText}`
      );
    }

    return resp.json();
  }
}
