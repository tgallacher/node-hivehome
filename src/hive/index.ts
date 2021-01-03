import { HiveFetch } from './HiveFetch';

import { Auth } from './auth';
import { Products } from './products';
import { Heating } from './heating';

export class Hive {
  public auth: Auth;
  public products: Products;
  public heating: Heating;

  constructor(email: string) {
    this.auth = new Auth(email);
    const fetch = new HiveFetch(this.auth);

    // todo: consider making this private?
    this.products = new Products(fetch);
    this.heating = new Heating(fetch);
  }
}
