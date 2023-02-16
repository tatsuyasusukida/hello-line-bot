import { Controller, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { createHmac } from 'crypto';
import { Request, Response } from 'express';
import { AppService } from './app.service';

interface LineWebhookDto {
  destination: string;
  events: any[];
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('api/v1/line/webhook')
  onApiV1LineWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    const lineSignature = req.headers['x-line-signature'];
    const channelSecret = process.env.CHANNEL_SECRET;
    const requestBody = req.rawBody;
    const lineSignatureVerify = createHmac('SHA256', channelSecret)
      .update(requestBody)
      .digest('base64');

    if (lineSignature !== lineSignatureVerify) {
      res.status(400).send('lineSignature !== lineSignatureVerify');
      return;
    }

    res.status(200).send('OK');
  }
}
