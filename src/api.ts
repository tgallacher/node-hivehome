import * as Fetch from './fetch';

const IDP_URL = 'https://cognito-idp.eu-west-1.amazonaws.com';

export enum AWS_IDPS {
  AUTH = 'AWSCognitoIdentityProviderService.InitiateAuth',
  RESPOND_AUTH_CHALLENGE = 'AWSCognitoIdentityProviderService.RespondToAuthChallenge',
}

export const callAuth = async (awsTargetLabel: string, body: Partial<{}>) => {
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
};
