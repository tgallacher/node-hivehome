import * as SRP from 'amazon-user-pool-srp-client';

import * as Fetch from './utils/fetch';
import { BEEKEEPER_URL } from './constants';

// Everybody seems to be in the same pool
const AWS_IDP_USER_POOLID = 'SamNfoWtf';
const AWS_IDP_USER_POOLCLIENT = '3rl4i0ajrmtdm8sbre54p9dvd9';

const IDP_URL = 'https://cognito-idp.eu-west-1.amazonaws.com';

enum AWS_IDPS {
  AUTH = 'AWSCognitoIdentityProviderService.InitiateAuth',
  RESPOND_AUTH_CHALLENGE = 'AWSCognitoIdentityProviderService.RespondToAuthChallenge',
}

export class Auth {
  private refreshToken: undefined | string;
  private accessToken: undefined | string;
  public token: undefined | string;

  private email: undefined | string;

  constructor(email: string) {
    this.email = email;
  }

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

  //
  // PRIVATE
  //

  private async callAuth(awsTargetLabel: string, body: Partial<{}>) {
    try {
      const data = await Fetch.post(IDP_URL, body, {
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': awsTargetLabel,
        },
      });

      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
