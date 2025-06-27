import { ApiProperty } from '@nestjs/swagger';

export class UrlStatsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  longUrl: string;

  @ApiProperty()
  shortUrl: string;

  @ApiProperty()
  clicks: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
