import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { AppService } from './app.service';

interface LineWebhookDto {
  destination: string;
  events: any[];
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @HttpCode(200)
  @Post('api/v1/line/webhook')
  onApiV1LineWebhook(
    @Headers() headers: { string: string },
    @Body() body: LineWebhookDto,
  ) {
    const lineSignature = headers['x-line-signature'];

    return {
      lineSignature,
      body,
    };
  }
}
