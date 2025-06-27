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
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlResponseDto } from './dto/url-response.dto';

@ApiTags('urls')
@Controller()
export class UrlShortenerServiceController {
  constructor(
    private readonly urlShortenerService: UrlShortenerServiceService,
  ) {}

  @Post('shorten')
  @ApiOperation({
    summary: 'Create a short URL',
    description: 'Receives a long URL and returns a shortened version.',
  })
  @ApiBody({
    type: CreateUrlDto,
    examples: {
      example: {
        summary: 'Shorten a URL',
        value: { longUrl: 'https://www.example.com' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'URL shortened successfully',
    type: UrlResponseDto,
    examples: {
      success: {
        summary: 'Shortened URL',
        value: {
          id: 'abc123',
          longUrl: 'https://www.example.com',
          shortUrl: 'http://localhost:3000/Up7b3A',
          userId: null,
          clicks: 0,
          createdAt: '2024-06-27T12:00:00.000Z',
          updatedAt: '2024-06-27T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL format',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid URL format',
        error: 'Bad Request',
      },
    },
  })
  async shorten(@Body() createUrlDto: CreateUrlDto) {
    return this.urlShortenerService.create(createUrlDto);
  }

  @Get(':shortUrl')
  @Redirect()
  @ApiOperation({
    summary: 'Redirects to the original URL',
    description:
      'Performs a 302 redirect to the original URL. NOTE: Swagger UI does not follow redirects, so you may see "Failed to fetch" here.',
  })
  @ApiParam({
    name: 'shortUrl',
    description: 'Short code generated for the URL',
    example: 'Up7b3A',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to the original URL',
    schema: {
      example: { url: 'https://www.example.com' },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Short URL not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'URL not found',
        error: 'Not Found',
      },
    },
  })
  async redirect(@Param('shortUrl') shortUrl: string) {
    const longUrl = await this.urlShortenerService.redirect(shortUrl);
    if (!longUrl) throw new NotFoundException();

    return { url: longUrl };
  }
}
