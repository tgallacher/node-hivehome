/**
 * @packageDocumentation
 * @module Hivehome
 */
import { HiveFetch } from './HiveFetch';

import { Auth } from './Auth';
import { Products } from './Products';
import { Heating } from './Heating';

/**
 * Main Hivehome SDK entrypoint.
 * Use this object to instigate access to Hivehome resources.
 */
export class Hivehome {
  /** Authenticate with Hivehome's API. */
  public auth: Auth;
  /** Hivehome generic product entities/resources. */
  public products: Products;
  /** Hivehome heating product entities/resources. */
  public heating: Heating;

  constructor(email: string) {
    this.auth = new Auth(email);
    const fetch = new HiveFetch(this.auth);

    // todo: consider making this private?
    this.products = new Products(fetch);
    this.heating = new Heating(fetch);
  }
}
