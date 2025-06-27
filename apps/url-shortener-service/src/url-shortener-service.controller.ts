import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Redirect,
} from '@nestjs/common';
import { UrlShortenerServiceService } from './url-shortener-service.service';
import { CreateUrlDto } from './dto/create-url.dto';

@Controller()
export class UrlShortenerServiceController {
  constructor(
    private readonly urlShortenerService: UrlShortenerServiceService,
  ) {}

  @Post('shorten')
  async shorten(@Body() createUrlDto: CreateUrlDto) {
    return this.urlShortenerService.create(createUrlDto);
  }

  @Get(':shortUrl')
  @Redirect()
  async redirect(@Param('shortUrl') shortUrl: string) {
    const longUrl = await this.urlShortenerService.redirect(shortUrl);
    if (!longUrl) throw new NotFoundException();

    return { url: longUrl };
  }
}
