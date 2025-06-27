import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class CreateUrlDto {
  @ApiProperty({ example: 'http://example.com' })
  @IsUrl()
  longUrl: string;
}
