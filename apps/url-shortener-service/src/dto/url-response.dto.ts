import { ApiProperty } from '@nestjs/swagger';

export class UrlResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  longUrl: string;

  @ApiProperty()
  shortUrl: string;

  @ApiProperty()
  userId: string | null;

  @ApiProperty()
  clicks: number;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;
}
