import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CampaignSegmentDto {
  @ApiProperty({ enum: ['all_active', 'uid_list'], example: 'all_active' })
  @IsEnum(['all_active', 'uid_list'])
  type!: 'all_active' | 'uid_list';

  @ApiPropertyOptional({ type: [String], example: ['firebase-uid-1'] })
  @ValidateIf((o: CampaignSegmentDto) => o.type === 'uid_list')
  @IsArray()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  firebaseUids?: string[];
}

export class SendCampaignDto {
  @ApiProperty({ example: 'Novidade no Conecta Geração' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title!: string;

  @ApiProperty({ example: 'Confira dicas para usar o app com mais segurança.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  body!: string;

  @ApiProperty({ example: '/' })
  @IsString()
  @IsNotEmpty()
  deepLink!: string;

  @ApiProperty({ type: CampaignSegmentDto })
  @ValidateNested()
  @Type(() => CampaignSegmentDto)
  segment!: CampaignSegmentDto;

  @ApiPropertyOptional({ example: 'campaign-2026-06-09-lancamento' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
