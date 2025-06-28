import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { UrlShortenerServiceService } from './url-shortener-service.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlResponseDto } from './dto/url-response.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { UrlStatsDto } from './dto/url-stats-response.dto';
import { GetUserId } from './decorator/get-user-id.decorator';
import { JwtAuthGuard, OptionalJwtAuthGuard } from 'libs/auth';

@ApiTags('urls')
@Controller()
export class UrlShortenerServiceController {
  constructor(
    private readonly urlShortenerService: UrlShortenerServiceService,
  ) {}

  @Post('shorten')
  @UseGuards(OptionalJwtAuthGuard)
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
  async shorten(
    @Body() createUrlDto: CreateUrlDto,
    @GetUserId() userId: string | undefined,
  ) {
    return this.urlShortenerService.create(createUrlDto, userId);
  }

  @Get('urls')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List user URLs with click stats' })
  @ApiResponse({
    status: 200,
    description: 'List of URLs for the authenticated user',
    type: [UrlStatsDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listUserUrls(@GetUserId() userId: string) {
    return this.urlShortenerService.listUserUrls(userId);
  }

  @Delete('urls/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a short URL' })
  @ApiParam({ name: 'id', description: 'URL id' })
  @ApiResponse({
    status: 200,
    description: 'URL deleted',
    type: UrlResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Not allowed',
    schema: {
      example: {
        statusCode: 403,
        message: 'Not allowed',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'URL not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'URL not found',
        error: 'Not Found',
      },
    },
  })
  async deleteUrl(@Param('id') id: string, @GetUserId() userId: string) {
    return this.urlShortenerService.deleteUrl(id, userId);
  }

  @Patch('urls/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the original URL of a short URL' })
  @ApiParam({ name: 'id', description: 'URL id' })
  @ApiBody({ type: UpdateUrlDto })
  @ApiResponse({
    status: 200,
    description: 'URL updated',
    type: UrlResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Not allowed',
    schema: {
      example: {
        statusCode: 403,
        message: 'Not allowed',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'URL not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'URL not found',
        error: 'Not Found',
      },
    },
  })
  async updateUrl(
    @Param('id') id: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @GetUserId() userId: string,
  ) {
    return this.urlShortenerService.updateUrl(id, updateUrlDto, userId);
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
