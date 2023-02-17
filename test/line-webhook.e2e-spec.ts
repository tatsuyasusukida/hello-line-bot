import { createHmac } from 'crypto';
import fetch from 'node-fetch';

describe('LINE Webhook', () => {
  it('/ (GET)', async () => {
    const targetUrl =
      process.env.WEBHOOK_URL || 'http://localhost:3000/api/v1/line/webhook';
    const requestBody = JSON.stringify({
      destination: 'U00000000000000000000000000000000',
      events: [
        {
          type: 'message',
          replyToken: 'replyToken',
          message: {
            type: 'text',
            text: 'Hello LINE',
          },
        },
      ],
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

    console.log(webhookResponse.status);
    console.log(await webhookResponse.text());
  });
});
