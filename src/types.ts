/**
 * @packageDocumentation
 * @module Hivehome.Types
 */
export type deviceTypes = 'heating';

// // Common public Class api
// export interface PublicApi {
//   get(): Promise<any>;
//   // update(): Promise<any>;
//   // delete(): Promise<any>;
// }

// Filter resource requests
export interface Filters {
  id: string;
  type: deviceTypes;
}

// Normalised Hivehome Product entity
export interface Product {
  id: string;
  type: string; // todo: enum?
  timestamp: number;
  schedule: {
    active: boolean;
  };
  boost: {
    active: boolean;
    minsRemaining: number;
  };
  temperature: {
    current: number;
    target: number;
  };
  holidayMode: Record<string, unknown>;
  meta: {
    online: boolean;
    model: string;
    version: string;
    parentId: string;
    zoneId: string;
    name: string;
    upgrade: {
      available: boolean;
      upgrading: boolean;
    };
  };
}
