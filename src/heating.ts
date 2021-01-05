/**
 * @packageDocumentation
 * @module Hivehome.Heating
 */
import merge from 'lodash.merge';
import { sub, getTime } from 'date-fns';
import qs from 'query-string';

import { BEEKEEPER_URL } from './constants';
import { Products } from './products';

export interface SdkHistoryOptions {
  start: number; // unix_ms
  end: number; // unix_ms
  operation: 'AVG' | 'MIN' | 'MAX';
  interval: {
    unit: 'MINUTES' | 'DAYS' | 'MONTHS';
    sample: number;
  };
}

export interface ApiHistoryDataPoint {
  date: number; // unix_ms
  temperature: number;
}

export interface SdkHistoryDataPoint {
  timestamp: number; // unix
  termpareature: number;
}

/**
 * Interact with _all_ registered Heating products.
 *
 * @note Currently _READ ONLY_
 */
export class Heating extends Products {
  /**
   * Get the current state of _all_ Heating products. This includes the current temperature of the device's location.
   *
   * @example
   * ```ts
   * import { Hivehome } from 'node-hivehome';
   *
   * (async () => {
   *   const hive = await new Hivehome('hello@example.com');
   *   await hive.auth.login('supersecretpassword');
   *
   *   const heatingProductsData = await hive.heating.get();
   *
   *   console.log(JSON.stringify(heatingProductsData, null, 2));
   * })()
   * ```
   *
   * @note Returned data is normalised before being returned.
   */
  public async get() {
    const products = await super.get();

    return products.filter((p) => p.type === 'heating');
  }

  /**
   * Return all historical temperature readings for a given Heating product.
   *
   * The range and sampling is configurable by supplying the optional {@link SdkHistoryOptions} object. Only the required options can be supplied, instead of the full object.
   *
   * The default is to provide all readings over the last **24 hours** with a **30 mins** sampling interval.
   *
   * @note It's not clear how long Hivehome store historical data for. This may error out depending on the combination of options provided.
   *
   * @example Default search criteria
   * ```ts
   * import { Hivehome } from 'node-hivehome';
   *
   * (async () => {
   *   const hive = await new Hivehome('hello@example.com');
   *   await hive.auth.login('supersecretpassword');
   *
   *   const tempHistory = await hive.heating.history('<product_id>');
   *
   *   console.log(JSON.stringify(tempHistory, null, 2));
   * })()
   * ```
   *
   * @example Get temperature readings for last 6 months, at 12 hrs intervals
   * ```ts
   * import { Hivehome } from 'node-hivehome';
   *
   * (async () => {
   *   const hive = await new Hivehome('hello@example.com');
   *   await hive.auth.login('supersecretpassword');
   *
   *   const tempHistory = await hive.heating.history('<product_id>', {
   *     start: 00000000, // calculate the Unix timestamp for now - 6 months
   *     interval: {
   *       unit: 'HOURS',
   *       sample: 12,
   *     },
   *   });
   *
   *   console.log(JSON.stringify(tempHistory, null, 2));
   * })()
   * ```
   */
  public async history(
    id: string,
    options: Partial<SdkHistoryOptions> = {}
  ): Promise<SdkHistoryDataPoint[]> {
    const defaultOpts: SdkHistoryOptions = {
      start: getTime(sub(Date.now(), { days: 1 })),
      end: Date.now(),
      operation: 'AVG',
      interval: {
        unit: 'MINUTES',
        sample: 30,
      },
    };
    const q = merge(defaultOpts, options) as SdkHistoryOptions;

    const url = qs.stringifyUrl({
      url: `${BEEKEEPER_URL}/history/heating/${id}`,
      query: {
        start: q.start,
        end: q.end,
        timeUnit: q.interval.unit,
        rate: q.interval.sample,
        operation: q.operation,
      },
    });

    const { data } = (await this.fetch.get(url)) as {
      data: ApiHistoryDataPoint[];
    };

    return this.transformHistory(data);
  }

  private transformHistory(
    data: ApiHistoryDataPoint[]
  ): SdkHistoryDataPoint[] {
    return data.map((d) => ({
      timestamp: Math.round(d.date / 1000),
      termpareature: Number.parseFloat(Number(d.temperature).toFixed(2)),
    }));
  }
}
