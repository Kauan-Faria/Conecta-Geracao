import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { POI_CATEGORIES } from '../../domain/value-objects/poi-category.vo';

export class GeoPointDto {
  @ApiProperty({ example: -22.9056 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiProperty({ example: -47.0608 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lon!: number;
}

export class SearchPoisRequestDto {
  @ApiProperty({ example: -22.9056 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiProperty({ example: -47.0608 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lon!: number;

  @ApiProperty({ enum: POI_CATEGORIES, example: 'pharmacy' })
  @IsEnum(POI_CATEGORIES)
  category!: (typeof POI_CATEGORIES)[number];

  @ApiPropertyOptional({ enum: [2, 5, 10], example: 5 })
  @IsOptional()
  @IsNumber()
  @IsIn([2, 5, 10])
  radiusKm?: number;
}

export class GeocodePlaceRequestDto {
  @ApiProperty({ example: 'Centro, Campinas' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  query!: string;
}

export class GetRouteRequestDto {
  @ApiProperty({ type: GeoPointDto })
  @ValidateNested()
  @Type(() => GeoPointDto)
  origin!: GeoPointDto;

  @ApiProperty({ type: GeoPointDto })
  @ValidateNested()
  @Type(() => GeoPointDto)
  destination!: GeoPointDto;
}
