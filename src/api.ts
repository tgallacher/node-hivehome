import fetch from 'node-fetch';

const SRP_URL = 'https://cognito-idp.eu-west-1.amazonaws.com';

export enum AWS_IDPS {
  AUTH = 'AWSCognitoIdentityProviderService.InitiateAuth',
  RESPOND_AUTH_CHALLENGE = 'AWSCognitoIdentityProviderService.RespondToAuthChallenge',
}

export const post = async (awsTargetLabel: string, body: Partial<{}>) => {
  try {
    const resp = await fetch(SRP_URL, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': awsTargetLabel,
      },
    });

    if (resp.status > 399) {
      throw new Error(
        `Request Error (code: ${resp.status}): ${resp.statusText}`
      );
    }

    return resp.json();
  } catch (error) {
    const e = new Error(error.message);

    throw e;
  }
};
