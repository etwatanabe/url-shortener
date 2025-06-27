import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, IsOptional, IsString } from 'class-validator';

export class CreateUrlDto {
  @ApiProperty({ example: 'http://example.com' })
  @IsUrl()
  longUrl: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}
