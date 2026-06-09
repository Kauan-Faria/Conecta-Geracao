import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchKnowledgeQueryDto {
  @ApiProperty({ example: 'pix', description: 'Termo de busca (mínimo 2 caracteres)' })
  @IsString()
  @MinLength(2)
  q!: string;
}
