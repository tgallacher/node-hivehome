import { BEEKEEPER_URL } from './constants';
import { RemoteResource } from './AbstractRemoteResource';
import type { Product } from './types';

export class Products extends RemoteResource {
  // todo: add ability to filter product. See Filters type
  // public async get(filters?: Partial<Filters>) {
  public async get() {
    const products = await this.fetch.get(`${BEEKEEPER_URL}/products`);

    // todo: Add support to toggle transform?
    return this.transform(products);
  }

  /**
   * Normalise data + decouple internals from upstream changes
   * @param products
   */
  private transform(products: Array<Record<string, any>>): Product[] {
    // todo: check response for other product types
    // this is currently specific for `type=heating`
    return products.map((p) => ({
      id: p.id,
      type: p.type,
      timestamp: Math.round(new Date().getTime() / 1000),
      schedule: {
        active: p.state.mode === 'SCHEDULE',
        // todo: add schedule details. Need to figure out `start` value.
      },
      boost: {
        active: p.state.mode === 'BOOST',
        minsRemaining: p.state.boost,
      },
      temperature: {
        current: p.props.temperature,
        target: p.state.target,
      },
      holidayMode: p.props.holidayMode,
      meta: {
        online: p.props.online,
        model: p.props.model,
        version: p.props.version,
        parentId: p.parent,
        zoneId: p.props.zone,
        name: p.state.name,
        upgrade: p.props.upgrade,
      },
    }));
  }
}
