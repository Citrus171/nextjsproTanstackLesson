import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Headers,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { UserJwtAuthGuard } from '../auth/guards/user-jwt-auth.guard';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @HttpCode(200)
  @UseGuards(UserJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Stripe Checkout Sessionを作成してURLを返す' })
  @ApiOkResponse({ schema: { properties: { url: { type: 'string' } } } })
  async createCheckoutSession(
    @Request() req: any,
    @Body() dto: CreateCheckoutSessionDto,
  ): Promise<{ url: string }> {
    return this.paymentsService.createCheckoutSession(req.user.id, dto);
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Stripe Webhookエンドポイント（署名検証済み）' })
  async handleWebhook(
    @Request() req: any,
    @Headers('stripe-signature') signature: string,
  ): Promise<void> {
    return this.paymentsService.handleWebhook(
      signature,
      req.rawBody as Buffer,
    );
  }
}
