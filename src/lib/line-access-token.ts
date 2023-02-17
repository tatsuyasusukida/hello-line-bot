import { JWS } from 'node-jose';
import fetch from 'node-fetch';

// LINE Messaging API のチャンネルトークン v2.1 を取得します
// https://developers.line.biz/ja/docs/messaging-api/generate-json-web-token/
export async function getLineAccessToken(
  privateKey: string,
  keyId: string,
  channelId: string,
): Promise<string> {
  // チャネルアクセストークンを取得するための JWT を発行します
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: keyId,
  };

  const payload = {
    iss: channelId,
    sub: channelId,
    aud: 'https://api.line.me/',
    exp: Math.floor(new Date().getTime() / 1000) + 60 * 30,
    token_exp: 60 * 60 * 24 * 30,
  };

  const jwt =
    (await JWS.createSign(
      {
        format: 'compact',
        fields: header,
      },
      JSON.parse(privateKey),
    )
      .update(JSON.stringify(payload))
      .final()) + '';

  // エンドポイントからチャネルアクセストークンを取得します
  const accessTokenUrl = 'https://api.line.me/oauth2/v2.1/token';
  const accessTokenResponse = await fetch(accessTokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_assertion_type:
        'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: jwt,
    }).toString(),
  });

  const accessTokenBody = await accessTokenResponse.json();
  return accessTokenBody.access_token;
}
