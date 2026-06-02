import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateConversationDto {
  @ApiPropertyOptional({ example: 'fazer-pix' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'topicSlug deve estar em kebab-case.',
  })
  topicSlug?: string;
}
