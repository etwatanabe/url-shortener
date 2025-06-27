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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UrlResponseDto } from './dto/url-response.dto';

@ApiTags('urls')
@Controller()
export class UrlShortenerServiceController {
  constructor(
    private readonly urlShortenerService: UrlShortenerServiceService,
  ) {}

  @Post('shorten')
  @ApiOperation({ summary: 'Create a short URL' })
  @ApiResponse({
    status: 201,
    description: 'URL shortened successfully',
    type: UrlResponseDto,
  })
  async shorten(@Body() createUrlDto: CreateUrlDto) {
    return this.urlShortenerService.create(createUrlDto);
  }

  @Get(':shortUrl')
  @Redirect()
  @ApiOperation({ summary: 'Redirects to the original URL' })
  @ApiResponse({ status: 302, description: 'Redirects to the original URL' })
  async redirect(@Param('shortUrl') shortUrl: string) {
    const longUrl = await this.urlShortenerService.redirect(shortUrl);
    if (!longUrl) throw new NotFoundException();

    return { url: longUrl };
  }
}
