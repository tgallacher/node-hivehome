/**
 * @packageDocumentation
 * @hidden
 * @module Hivehome.HiveFetch
 */
import merge from 'lodash.merge';

import type { Auth } from './Auth';
import { fetch } from './utils/fetch';

/**
 * Helper class built into Hivehome resource classes to simplify API fetching, with built in basic HTTP response error handling and token near-expiry check and refresh.
 */
export class HiveFetch {
  private auth: Auth;

  constructor(auth: Auth) {
    this.auth = auth;
  }

  /**
   * Authenticated GET request, with built in token check + refresh.
   */
  async get(url: string, options?: Partial<RequestInit>) {
    await this.auth.checkTokenAndRefresh();

    const reqOpts = merge(options, {
      headers: {
        Authorization: this.auth.token,
      },
    });

    return fetch(url, reqOpts);
  }

  /**
   * Authenticated POST request, with built in token check + refresh.
   */
  async post(
    url: string,
    body: Partial<Record<string, unknown>>,
    options?: Partial<RequestInit>
  ) {
    await this.auth.checkTokenAndRefresh();

    const reqOpts = merge(options, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Authorization: this.auth.token,
      },
    });

    return fetch(url, reqOpts);
  }
}
