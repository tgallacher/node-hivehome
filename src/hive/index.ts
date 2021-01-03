import { HiveFetch } from './utils/HiveFetch';

import { Auth } from './auth';
import { Products } from './products';

export class Hive {
  public auth: Auth;
  public products: Products;

  constructor(email: string) {
    this.auth = new Auth(email);
    const fetch = new HiveFetch(this.auth);

    this.products = new Products(fetch);
  }

  // public async getCurrentTemp() {
  //   try {
  //     const products = await this.getProducts();

  //     const heatingProduct: Record<string, any> | undefined = products
  //       .filter(p => p.type === 'heating') // Only `heating` products give us the temp
  //       .shift(); // TODO: Need to support more than 1 device?

  //     if (!heatingProduct) {
  //       throw new Error(
  //         `No heating product found! Number of all products found = ${products.length}`
  //       );
  //     }

  //     // return heatingProduct?.props?.temperature;
  //     return heatingProduct;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
