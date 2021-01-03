import merge from 'lodash.merge';
import { sub, getTime } from 'date-fns';
import qs from 'query-string';

import { BEEKEEPER_URL } from './constants';
import { Products } from './products';

interface HistoryOptions {
  start: number; // unix_ms
  end: number; // unix_ms
  operation: 'AVG' | 'MIN' | 'MAX';
  interval: {
    type: 'MINUTES' | 'DAYS' | 'MONTHS';
    sample: number;
  };
}

interface HiveHomeApiHistoryDataPoint {
  date: number; // unix_ms
  temperature: number;
}

interface HiveSDKHistoryDataPoint {
  timestamp: number; // unix
  termpareature: number;
}

export class Heating extends Products {
  public async get() {
    const products = await super.get();

    return products.filter((p) => p.type === 'heating');
  }

  public async history(
    id: string,
    options: Partial<HistoryOptions> = {}
  ): Promise<HiveSDKHistoryDataPoint[]> {
    const defaultOpts: HistoryOptions = {
      start: getTime(sub(Date.now(), { days: 1 })),
      end: Date.now(),
      operation: 'AVG',
      interval: {
        type: 'MINUTES',
        sample: 30,
      },
    };
    const q = merge(defaultOpts, options) as HistoryOptions;

    const url = qs.stringifyUrl({
      url: `${BEEKEEPER_URL}/history/heating/${id}`,
      query: {
        start: q.start,
        end: q.end,
        timeUnit: q.interval.type,
        rate: q.interval.sample,
        operation: q.operation,
      },
    });

    const { data } = (await this.fetch.get(url)) as {
      data: HiveHomeApiHistoryDataPoint[];
    };

    return this.transformHistory(data);
  }

  private transformHistory(
    data: HiveHomeApiHistoryDataPoint[]
  ): HiveSDKHistoryDataPoint[] {
    return data.map((d) => ({
      timestamp: Math.round(d.date / 1000),
      termpareature: Number.parseFloat(Number(d.temperature).toFixed(2)),
    }));
  }
}
