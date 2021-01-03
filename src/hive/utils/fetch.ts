import fetch from 'node-fetch';
import merge from 'lodash.merge'

import type { Auth } from '../auth';

export class HiveFetch {
  private auth: Auth;

  constructor(auth: Auth) {
    this.auth = auth;
  }

  /**
   * Authenticated GET request with built in token refresh, if required.
   * @param url
   * @param options
   */
  async get(url: string, options?: Partial<RequestInit>) {
    await this.auth.checkTokenAndRefresh();

    const reqOpts = merge(options, {
      headers: {
        'Authorization': this.auth.token,
      }
    })

    return HiveFetch.fetch(url, reqOpts);
  }

  /**
   * Authenticated POST request with built in token refresh, if required.
   * @param url
   * @param body
   * @param options
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
        'Authorization': this.auth.token,
      }
    })

    return HiveFetch.fetch(url, reqOpts);
  }

  /**
   * Native fetch with basic HTTP error handling.
   *
   * Note: Used inside Auth module
   * @param url
   * @param options
   */
  static async fetch(url: string, options: Partial<RequestInit> = {}) {
    const reqOpts = merge({
      headers: {
        'Content-Type': 'application/json',
      }
    }, options);

    const resp = await fetch(url, reqOpts);

    if (resp.status > 399) {
      throw new Error(
        `Request Error (code: ${resp.status}): ${resp.statusText}`
      );
    }

    return resp.json();
  }
}
