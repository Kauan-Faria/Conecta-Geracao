import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SendInternalCampaignUseCase } from '../application/use-cases/send-internal-campaign.use-case';
import { DomainError } from '../domain/errors/domain.errors';
import { InternalCampaignAuthPolicy } from '../domain/services/internal-campaign-auth.policy';
import { CampaignSegment } from '../domain/value-objects/campaign-segment.vo';
import { InternalServiceKeyGuard } from '../infrastructure/auth/internal-service-key.guard';
import { SendCampaignDto } from './dto/send-campaign.dto';
import { toCampaignResponseDto } from './mappers/campaigns.mapper';

@ApiTags('notifications-internal')
@Controller('notifications/campaigns')
@UseGuards(InternalServiceKeyGuard)
export class InternalCampaignsController {
  constructor(
    private readonly sendCampaign: SendInternalCampaignUseCase,
    private readonly authPolicy: InternalCampaignAuthPolicy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Disparar campanha push interna (service key)' })
  @ApiHeader({ name: 'X-Internal-Service-Key', required: true })
  async createCampaign(
    @Headers('x-internal-service-key') serviceKey: string | undefined,
    @Headers('x-requested-by') requestedBy: string | undefined,
    @Body() dto: SendCampaignDto,
  ) {
    this.authPolicy.assertAuthorized(serviceKey);

    let segment: CampaignSegment;
    try {
      segment = CampaignSegment.create({
        type: dto.segment.type,
        firebaseUids: dto.segment.firebaseUids,
      });
    } catch (error) {
      if (error instanceof DomainError) {
        throw new BadRequestException({
          error: { code: 'VALIDATION_ERROR', message: error.message },
        });
      }
      throw error;
    }

    try {
      const result = await this.sendCampaign.execute({
        title: dto.title,
        body: dto.body,
        deepLink: dto.deepLink,
        segment,
        idempotencyKey: dto.idempotencyKey,
        requestedBy: requestedBy ?? 'internal-service',
      });

      return toCampaignResponseDto(result.campaign, result.idempotentReplay);
    } catch (error) {
      if (error instanceof DomainError) {
        throw new BadRequestException({
          error: { code: error.code, message: error.message },
        });
      }
      throw error;
    }
  }
}
