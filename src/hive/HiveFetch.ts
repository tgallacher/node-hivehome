import merge from 'lodash.merge'

import type { Auth } from './auth';
import { fetch } from './utils/fetch';

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

    return fetch(url, reqOpts);
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

    return fetch(url, reqOpts);
  }
}
