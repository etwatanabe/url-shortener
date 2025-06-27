import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class UpdateUrlDto {
  @ApiProperty({ example: 'http://new-example.com' })
  @IsUrl()
  longUrl: string;
}
