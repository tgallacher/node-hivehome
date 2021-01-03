import * as Fetch from './utils/fetch';

import { Auth } from './auth';

const BEEKEEPER_URL = 'https://beekeeper-uk.hivehome.com/1.0';

export class Hive {
  private normaliseData: boolean = true;

  private auth: Auth;

  constructor(email: string) {
    this.auth = new Auth(email);
  }

  public shouldNormaliseData(flag: boolean) {
    this.normaliseData = flag;

    return this;
  }

  public async getProducts() {
    try {
      const data = await Fetch.get(`${BEEKEEPER_URL}/products`, {
        // @ts-ignore
        headers: {
          Authorization: this.auth.token,
        },
      });

      return this.normaliseData ? this.transformProductsData(data) : data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Normalise key data points
  private transformProductsData(products: Array<Record<string, any>>) {
    return products.map(p => ({
      type: p.type,
      deviceId: p.id,
      timestamp: Math.round(new Date().getTime() / 1000),
      online: p.props?.online,
      model: p.props?.model,
      temperature: p.props?.temperature,
    }));
  }

  public async getCurrentTemp() {
    try {
      const products = await this.getProducts();

      const heatingProduct: Record<string, any> | undefined = products
        .filter(p => p.type === 'heating') // Only `heating` products give us the temp
        .shift(); // TODO: Need to support more than 1 device?

      if (!heatingProduct) {
        throw new Error(
          `No heating product found! Number of all products found = ${products.length}`
        );
      }

      // return heatingProduct?.props?.temperature;
      return heatingProduct;
    } catch (error) {
      throw error;
    }
  }
}
