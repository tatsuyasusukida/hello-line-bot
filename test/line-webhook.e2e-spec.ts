import { createHmac } from 'crypto';
import fetch from 'node-fetch';

describe('LINE Webhook', () => {
  it('/ (GET)', async () => {
    const targetUrl = 'http://localhost:3000/api/v1/line/webhook';
    const requestBody = JSON.stringify({
      destination: 'U00000000000000000000000000000000',
      events: [],
    });

    const channelSecret = process.env.CHANNEL_SECRET;
    const lineSignature = createHmac('SHA256', channelSecret)
      .update(requestBody)
      .digest('base64');

    const webhookResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'X-Line-Signature': lineSignature,
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    console.log(await webhookResponse.text());
  });
});
