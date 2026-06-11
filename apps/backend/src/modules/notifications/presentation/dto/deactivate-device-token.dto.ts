import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class DeactivateDeviceTokenDto {
  @ApiProperty({ example: 'fcm-token-example-string-min-10-chars' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  token!: string;
}
