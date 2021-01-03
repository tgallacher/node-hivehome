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
