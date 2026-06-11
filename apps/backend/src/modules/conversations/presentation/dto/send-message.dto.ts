import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'Como faço um Pix?' })
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  content!: string;

  @ApiPropertyOptional({ enum: ['foreground', 'background'] })
  @IsOptional()
  @IsIn(['foreground', 'background'])
  appState?: 'foreground' | 'background';
}
