import { strictEqual } from 'assert';
import fetch from 'node-fetch';

describe('LINE Link', () => {
  it('/ (GET)', async () => {
    const targetUrl =
      process.env.BASE_URL + '/api/v1/line/link?linkToken=linkToken';

    const linkResponse = await fetch(targetUrl, {
      redirect: 'manual',
    });

    strictEqual(linkResponse.status, 302);
    strictEqual(
      linkResponse.headers.get('location'),
      'https://access.line.me/dialog/bot/accountLink?linkToken=linkToken&nonce=nonce-nonce-nonce',
    );
  });
});
