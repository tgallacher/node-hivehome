/**
 * @packageDocumentation
 * @hidden
 */
import type { HiveFetch } from './HiveFetch';

/**
 * Baseline for any resource from Hivehome's API
 */
export abstract class RemoteResource {
  protected fetch: HiveFetch;

  constructor(fetch: HiveFetch) {
    this.fetch = fetch;
  }

  abstract get(): Promise<any>;

  // todo: add support for `edit`
  // abstract update(): Promise<any>;
}
