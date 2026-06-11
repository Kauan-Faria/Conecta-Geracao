import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDeviceTokenDto {
  @ApiProperty({ example: 'fcm-token-example-string-min-10-chars' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  token!: string;

  @ApiProperty({ enum: ['ios', 'android'], example: 'android' })
  @IsEnum(['ios', 'android'], { message: 'platform deve ser ios ou android.' })
  platform!: 'ios' | 'android';
}
