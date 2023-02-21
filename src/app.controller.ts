import { validateSignature, WebhookRequestBody } from '@line/bot-sdk';
import {
  Controller,
  Get,
  Post,
  RawBodyRequest,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { AppService } from './app.service';
import { getLineAccessToken } from './lib/line-access-token';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('api/v1/line/webhook')
  async onApiV1LineWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    // 署名を検証して LINE からのアクセスであることを検証します
    const lineSignature = req.headers['x-line-signature'] as string;
    const channelSecret = process.env.CHANNEL_SECRET;
    const requestBody = req.rawBody;

    if (!validateSignature(requestBody, channelSecret, lineSignature)) {
      res.status(400).send('lineSignature !== lineSignatureVerify');
      return;
    }

    const webhookRequest = JSON.parse(
      requestBody.toString(),
    ) as WebhookRequestBody;

    const channelAccessToken = await getLineAccessToken(
      process.env.PRIVATE_KEY,
      process.env.KEY_ID,
      process.env.CHANNEL_ID,
    );

    for (const event of webhookRequest.events) {
      if (event.type === 'message' && event.message.type === 'text') {
        // 連携トークンを取得します
        const userId = event.source.userId;

        if (!userId) {
          continue;
        }

        const linkTokenUrl = `https://api.line.me/v2/bot/user/${userId}/linkToken`;
        const linkTokenResponse = await fetch(linkTokenUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${channelAccessToken}`,
          },
        });

        if (linkTokenResponse.status !== 200) {
          console.warn(await linkTokenResponse.text());
          continue;
        }

        const linkToken: string = (await linkTokenResponse.json()).linkToken;

        // ユーザーを連携 URL にリダイレクトします
        const replyUrl = 'https://api.line.me/v2/bot/message/reply';
        const replyResponse = await fetch(replyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            Authorization: `Bearer ${channelAccessToken}`,
          },
          body: JSON.stringify({
            replyToken: event.replyToken,
            messages: [
              {
                type: 'template',
                altText: 'Account Link',
                template: {
                  type: 'buttons',
                  text: 'Account Link',
                  actions: [
                    {
                      type: 'uri',
                      label: 'Account Link',
                      uri:
                        process.env.BASE_URL +
                        '/api/v1/line/link?' +
                        new URLSearchParams({
                          linkToken: linkToken,
                        }).toString(),
                    },
                  ],
                },
              },
            ],
          }),
        });

        if (replyResponse.status !== 200) {
          console.warn(await replyResponse.text());
        }
      }
    }

    // 送信者のユーザー ID を確認するためコンソール出力しています
    console.log(JSON.stringify(webhookRequest));

    res.status(200).send('OK');
  }

  // nonce を生成してユーザーを LINE プラットフォームにリダイレクトします
  @Get('api/v1/line/link')
  async onLink(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
    const linkToken = req.query.linkToken as string;
    const nonce = 'nonce-nonce-nonce';
    const redirectUrl =
      'https://access.line.me/dialog/bot/accountLink?' +
      new URLSearchParams({
        linkToken: linkToken,
        nonce: nonce,
      });

    res.redirect(redirectUrl);
  }
}
