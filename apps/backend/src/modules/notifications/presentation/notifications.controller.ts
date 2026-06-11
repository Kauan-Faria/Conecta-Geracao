import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FirebaseAuthGuard } from '../../../shared/auth/firebase-auth.guard';
import { AuthenticatedUser, CurrentUser } from '../../../shared/auth/current-user.decorator';
import { DomainError } from '../domain/errors/domain.errors';
import { RegisterDeviceTokenUseCase } from '../application/use-cases/register-device-token.use-case';
import { UpdateNotificationPreferenceUseCase } from '../application/use-cases/update-notification-preference.use-case';
import { DeactivateDeviceTokenUseCase } from '../application/use-cases/deactivate-device-token.use-case';
import { GetNotificationPreferenceUseCase } from '../application/use-cases/get-notification-preference.use-case';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { DeactivateDeviceTokenDto } from './dto/deactivate-device-token.dto';
import {
  toDeviceTokenDto,
  toNotificationPreferenceDto,
} from './mappers/notifications.mapper';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly registerDeviceToken: RegisterDeviceTokenUseCase,
    private readonly updateNotificationPreference: UpdateNotificationPreferenceUseCase,
    private readonly deactivateDeviceToken: DeactivateDeviceTokenUseCase,
    private readonly getNotificationPreference: GetNotificationPreferenceUseCase,
  ) {}

  @Put('device-token')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Registrar ou atualizar token FCM do dispositivo' })
  async putDeviceToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterDeviceTokenDto,
  ) {
    const result = await this.registerDeviceToken.execute(
      user.uid,
      dto.token,
      dto.platform,
    );
    if (!result.ok) throw this.mapDomainError(result.error);
    return toDeviceTokenDto(result.value);
  }

  @Delete('device-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Inativar token FCM no logout' })
  async deleteDeviceToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: DeactivateDeviceTokenDto,
  ): Promise<void> {
    const result = await this.deactivateDeviceToken.execute(user.uid, dto.token);
    if (!result.ok) throw this.mapDomainError(result.error);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Obter preferência de notificações do usuário' })
  async getPreferences(@CurrentUser() user: AuthenticatedUser) {
    const result = await this.getNotificationPreference.execute(user.uid);
    if (!result.ok) throw this.mapDomainError(result.error);
    return toNotificationPreferenceDto(result.value);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Atualizar preferência de notificações' })
  async putPreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateNotificationPreferenceDto,
  ) {
    const result = await this.updateNotificationPreference.execute(
      user.uid,
      dto.enabled,
    );
    if (!result.ok) throw this.mapDomainError(result.error);
    return toNotificationPreferenceDto(result.value);
  }

  private mapDomainError(error: DomainError): never {
    throw new BadRequestException({
      error: { code: 'VALIDATION_ERROR', message: error.message },
    });
  }
}
