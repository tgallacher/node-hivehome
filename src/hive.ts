import * as SRP from 'amazon-user-pool-srp-client';
import * as Fetch from './fetch';
import { callAuth, AWS_IDPS } from './api';

// Everybody seems to be in the same pool
const AWS_IDP_USER_POOLID = 'SamNfoWtf';
const AWS_IDP_USER_POOLCLIENT = '3rl4i0ajrmtdm8sbre54p9dvd9';

const BEEKEEPER_URL = 'https://beekeeper-uk.hivehome.com/1.0';

export class Hive {
  private email: undefined | string;
  private password: undefined | string;

  private refreshToken: undefined | string;
  private accessToken: undefined | string;
  private token: undefined | string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  public async login() {
    const userPoolId =
      process.env.AWS_COGNITO_IDS_USERPOOLID?.split('_')[1] ??
      AWS_IDP_USER_POOLID;
    const clientId =
      process.env.AWS_COGNITO_IDS_USERPOOLCLIENT || AWS_IDP_USER_POOLCLIENT;
    const srp = new SRP.SRPClient(userPoolId);
    const SRP_A = srp.calculateA();

    const { ChallengeName, ChallengeParameters, Session } = await callAuth(
      AWS_IDPS.AUTH,
      {
        ClientId: clientId,
        AuthFlow: 'USER_SRP_AUTH',
        AuthParameters: {
          USERNAME: this.email,
          SRP_A,
        },
      }
    );

    const hkdf = srp.getPasswordAuthenticationKey(
      ChallengeParameters.USER_ID_FOR_SRP,
      this.password,
      ChallengeParameters.SRP_B,
      ChallengeParameters.SALT
    );
    const dateNow = SRP.getNowString();
    const signatureString = SRP.calculateSignature(
      hkdf,
      userPoolId,
      ChallengeParameters.USER_ID_FOR_SRP,
      ChallengeParameters.SECRET_BLOCK,
      dateNow
    );

    const { AuthenticationResult } = await callAuth(
      AWS_IDPS.RESPOND_AUTH_CHALLENGE,
      {
        ClientId: clientId,
        ChallengeName,
        ChallengeResponses: {
          PASSWORD_CLAIM_SECRET_BLOCK: ChallengeParameters.SECRET_BLOCK,
          PASSWORD_CLAIM_SIGNATURE: signatureString,
          TIMESTAMP: dateNow,
          USERNAME: ChallengeParameters.USER_ID_FOR_SRP,
        },
        Session,
      }
    );

    this.refreshToken = AuthenticationResult.RefreshToken;
    this.accessToken = AuthenticationResult.AccessToken;
    this.token = AuthenticationResult.IdToken;
  }

  public async refresh() {
    try {
      const data = await Fetch.post(`${BEEKEEPER_URL}/cognito/refresh-token`, {
        body: JSON.stringify({
          token: this.token,
          refreshToken: this.refreshToken,
          accessToken: this.accessToken,
        }),
      });

      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public async products() {
    try {
      const data = await Fetch.get(`${BEEKEEPER_URL}/products`, {
        // @ts-ignore
        headers: {
          Authorization: this.token,
        },
      });

      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // TODO: Need for more than 1 device?
  public async getCurrentTemp() {
    try {
      const products = await this.products();

      const heatingProduct: Record<string, any> | undefined = products
        .filter(p => p.type === 'heating')
        .shift();

      if (!heatingProduct) {
        throw new Error(
          `No heating product found! Number of all products found = ${products.length}`
        );
      }

      return heatingProduct?.props?.temperature;
    } catch (error) {}
  }
}
