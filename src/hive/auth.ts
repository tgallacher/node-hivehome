import { differenceInMinutes, isPast } from 'date-fns';
import * as SRP from 'amazon-user-pool-srp-client';
import jwtdecode from 'jwt-decode';

import { fetch } from './utils/fetch';
import { BEEKEEPER_URL } from './constants';

// Everybody seems to be in the same pool
const AWS_IDP_USER_POOLID = 'SamNfoWtf';
const AWS_IDP_USER_POOLCLIENT = '3rl4i0ajrmtdm8sbre54p9dvd9';

const IDP_URL = 'https://cognito-idp.eu-west-1.amazonaws.com';

enum AWS_IDPS {
  RESPOND_AUTH_CHALLENGE = 'AWSCognitoIdentityProviderService.RespondToAuthChallenge',
  AUTH = 'AWSCognitoIdentityProviderService.InitiateAuth',
}

export class Auth {
  private refreshToken: undefined | string;
  private accessToken: undefined | string;
  public token: undefined | string;

  private tokenExp?: number; // unix
  private tokenValidForMins?: number;

  private email: undefined | string;

  constructor(email: string) {
    this.email = email;
  }

  // todo: add support for providing pass via ENV vars?
  public async login(password: string) {
    const userPoolId =
      process.env.AWS_COGNITO_IDS_USERPOOLID?.split('_')[1] ??
      AWS_IDP_USER_POOLID;
    const clientId =
      process.env.AWS_COGNITO_IDS_USERPOOLCLIENT || AWS_IDP_USER_POOLCLIENT;

    const srp = new SRP.SRPClient(userPoolId);
    const SRP_A = srp.calculateA();

    const { ChallengeName, ChallengeParameters, Session } = await this.callAuth(
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

    const dateNow = SRP.getNowString();
    const hkdf = srp.getPasswordAuthenticationKey(
      ChallengeParameters.USER_ID_FOR_SRP,
      password,
      ChallengeParameters.SRP_B,
      ChallengeParameters.SALT
    );
    const signatureString = SRP.calculateSignature(
      hkdf,
      userPoolId,
      ChallengeParameters.USER_ID_FOR_SRP,
      ChallengeParameters.SECRET_BLOCK,
      dateNow
    );

    const { AuthenticationResult } = await this.callAuth(
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

    this.refreshToken = AuthenticationResult.RefreshToken as string;
    this.accessToken = AuthenticationResult.AccessToken as string;
    this.token = AuthenticationResult.IdToken as string;

    // parse token expiry
    const { exp, iat } = jwtdecode(this.token) as {
      phone_number_verified: boolean;
      locale: string;
      email: string;
      aud: string; // audience (same as client ID)
      exp: number; // expiry
      iat: number; // issued at
    };

    if (!exp || !iat) {
      throw new Error(
        '[Auth] Token decoding error; token timestamps are undefined.'
      );
    }

    this.tokenExp = exp;
    // date-fns requires `unix_ms`
    this.tokenValidForMins = differenceInMinutes(exp * 1000, iat * 1000);

    return this;
  }

  /**
   * Refresh auth token
   */
  public async refresh() {
    const { token, refreshToken, accessToken } = await fetch(
      `${BEEKEEPER_URL}/cognito/refresh-token`,
      {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: this.refreshToken,
          accessToken: this.accessToken,
          token: this.token,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!token || !refreshToken || !accessToken) {
      throw new Error(
        '[Auth] Refresh API endpoint has changed response structure. Unable to find refreshed tokens'
      );
    }

    this.token = token;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    return this;
  }

  // Refresh token if auth is near expiry
  public async checkTokenAndRefresh() {
    if (this.isTokenExpired()) {
      throw new Error(
        '[Auth] token has expired. Re-run `.auth.login(password)`.'
      );
    }

    return this.isTokenDueRefresh() ? this.refresh() : this;
  }

  //
  // PRIVATE
  //

  private isTokenExpired() {
    if (!this.tokenExp) {
      throw new Error(
        '[Auth] Unknown token Expiry. Did you forget to run `.auth.login(password)`?'
      );
    }

    // date-fns requires `unix_ms`
    return isPast(this.tokenExp * 1000);
  }

  private isTokenDueRefresh() {
    if (!this.tokenExp) {
      throw new Error(
        '[Auth] Unknown token Expiry. Did you forget to run `.auth.login(password)`?'
      );
    }

    // date-fns requires `unix_ms`
    const mins2Expiry = differenceInMinutes(this.tokenExp * 1000, Date.now());

    return (
      mins2Expiry <= 15 ||
      mins2Expiry <= (this.tokenValidForMins as number) * 0.33
    );
  }

  private async callAuth(awsTargetLabel: string, body: Partial<{}>) {
    const data = await fetch(IDP_URL, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': awsTargetLabel,
      },
    });

    return data;
  }
}
