declare module 'amazon-user-pool-srp-client' {
  export const SRPClient: any;
  export const calculateSignature = (
    hkdf: string,
    userPoolId: string,
    username: string,
    secretBlock: string,
    dateNow: string
  ) => string;
  export const getNowString = () => string;
}
