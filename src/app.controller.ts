import { validateSignature, WebhookRequestBody } from '@line/bot-sdk';
import { Controller, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
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

    // for (const event of webhookRequest.events) {
    //   if (event.type === 'message' && event.message.type === 'text') {
    //     const channelAccessToken = await getLineAccessToken(
    //       process.env.PRIVATE_KEY,
    //       process.env.KEY_ID,
    //       process.env.CHANNEL_ID,
    //     );

    //     const replyUrl = 'https://api.line.me/v2/bot/message/reply';
    //     const replyResponse = await fetch(replyUrl, {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json; charset=UTF-8',
    //         Authorization: `Bearer ${channelAccessToken}`,
    //       },
    //       body: JSON.stringify({
    //         replyToken: event.replyToken,
    //         messages: [
    //           {
    //             type: 'text',
    //             text: event.message.text,
    //           },
    //         ],
    //       }),
    //     });

    //     if (replyResponse.status !== 200) {
    //       console.warn(await replyResponse.text());
    //     }
    //   }
    // }

    console.log(JSON.stringify(webhookRequest));

    res.status(200).send('OK');
  }
}
