import fetch from 'node-fetch';
import { getLineAccessToken } from '../src/lib/line-access-token';

describe('LINE Webhook', () => {
  it('/ (GET)', async () => {
    const channelAccessToken = await getLineAccessToken(
      process.env.PRIVATE_KEY,
      process.env.KEY_ID,
      process.env.CHANNEL_ID,
    );

    const pushMessageUrl = 'https://api.line.me/v2/bot/message/push';
    const pushMessageResponse = await fetch(pushMessageUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: process.env.TO,
        messages: [
          {
            type: 'text',
            text: 'プッシュメッセージです',
          },
        ],
      }),
    });

    if (pushMessageResponse.status !== 200) {
      console.warn(await pushMessageResponse.text());
    }
  });
});
