import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from 'libs/prisma';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlResponseDto } from './dto/url-response.dto';
import { UrlStatsDto } from './dto/url-stats-response.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { ConfigService } from '@nestjs/config';
import { CustomLoggerService } from 'libs/custom-logger';

@Injectable()
export class UrlShortenerServiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly logger: CustomLoggerService,
  ) {}

  private async generateShortUrl(): Promise<string> {
    let shortUrl: string;

    do {
      shortUrl = randomBytes(4).toString('base64url').slice(0, 6);
      this.logger.debug(`Attempting to generate short URL: ${shortUrl}`);
    } while (
      await this.prisma.url.findFirst({
        where: { shortUrl: shortUrl, deletedAt: null },
      })
    );

    this.logger.log(
      `Short URL generated successfully: ${shortUrl}`,
      UrlShortenerServiceService.name,
    );

    return shortUrl;
  }

  private normalizeUrl(url: string): string {
    this.logger.log(
      `Attempting to normalize URL ${url}`,
      UrlShortenerServiceService.name,
    );

    url = url.trim();

    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    try {
      new URL(url);
    } catch {
      this.logger.warn(
        `Failed to normalize URL: invalid URL format (${url})`,
        UrlShortenerServiceService.name,
      );
      throw new BadRequestException('Invalid URL format');
    }

    this.logger.log(
      `URL normalized successfully: ${url}`,
      UrlShortenerServiceService.name,
    );

    return url;
  }

  private formatShortUrl(shortUrl: string): string {
    return `${this.config.get<string>('BASE_URL') || 'http://localhost:3000'}/${shortUrl}`;
  }

  async create(
    createUrlDto: CreateUrlDto,
    userId?: string,
  ): Promise<UrlResponseDto> {
    const { longUrl: inputUrl } = createUrlDto;

    this.logger.log(
      `Attempting to create short URL for "${inputUrl}" ${userId ? ` (User ID: ${userId})` : ''}`,
      UrlShortenerServiceService.name,
    );

    const normalizedUrl = this.normalizeUrl(inputUrl);

    const shortUrl = await this.generateShortUrl();

    const url = await this.prisma.url.create({
      data: {
        userId: userId ?? null,
        longUrl: normalizedUrl,
        shortUrl: shortUrl,
      },
    });

    const formattedUrl = this.formatShortUrl(url.shortUrl);

    this.logger.log(
      `Short URL created successfully: ${formattedUrl} (id: ${url.id})`,
      UrlShortenerServiceService.name,
    );

    return {
      id: url.id,
      longUrl: url.longUrl,
      shortUrl: formattedUrl,
      userId: url.userId,
      clicks: url.clicks,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    };
  }

  async findByShortUrl(shortUrl: string): Promise<UrlResponseDto> {
    this.logger.log(
      `Attempting to find URL by short URL "${shortUrl}"`,
      UrlShortenerServiceService.name,
    );

    const url = await this.prisma.url.findFirst({
      where: { shortUrl: shortUrl, deletedAt: null },
    });

    if (!url) {
      this.logger.warn(
        `Failed to find URL by short URL: Short URL "${shortUrl}" not found`,
        UrlShortenerServiceService.name,
      );
      throw new NotFoundException('URL not found');
    }

    this.logger.log(
      `Found URL for short URL "${shortUrl}": ${url.longUrl}`,
      UrlShortenerServiceService.name,
    );

    return {
      id: url.id,
      longUrl: url.longUrl,
      shortUrl: url.shortUrl,
      userId: url.userId,
      clicks: url.clicks,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    };
  }

  async redirect(shortUrl: string): Promise<string> {
    this.logger.log(
      `Attempting to redirect short URL "${shortUrl}`,
      UrlShortenerServiceService.name,
    );

    const url = await this.findByShortUrl(shortUrl);

    if (url.userId) {
      this.prisma.url
        .update({
          where: { id: url.id },
          data: { clicks: { increment: 1 } },
        })
        .then(() => {
          this.logger.log(
            `Click count incremented (${url.clicks} clicks) for short URL "${shortUrl}" (user ID: ${url.userId})`,
            UrlShortenerServiceService.name,
          );
        })
        .catch((error: unknown) => {
          if (error instanceof Error) {
            this.logger.error(
              `Error updating click count for short URL "${shortUrl}": ${error.message}`,
              error.stack,
              UrlShortenerServiceService.name,
            );
          } else {
            this.logger.error(
              `Unknown error updating click count for short URL "${shortUrl}": ${JSON.stringify(error)}`,
              undefined,
              UrlShortenerServiceService.name,
            );
          }
        });
    }

    this.logger.log(
      `Redirecting short URL "${shortUrl}" to ${url.longUrl}`,
      UrlShortenerServiceService.name,
    );

    return url.longUrl;
  }

  async listUserUrls(userId: string): Promise<UrlStatsDto[]> {
    const urls = await this.prisma.url.findMany({
      where: {
        userId: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        longUrl: true,
        shortUrl: true,
        clicks: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    this.logger.log(
      `User ${userId} listed ${urls.length} URLs`,
      UrlShortenerServiceService.name,
    );

    return urls;
  }

  async updateUrl(
    id: string,
    updateUrlDto: UpdateUrlDto,
    userId: string,
  ): Promise<UrlResponseDto> {
    this.logger.log(
      `User ${userId} attempting to update URL ${id}`,
      UrlShortenerServiceService.name,
    );

    const url = await this.prisma.url.findFirst({
      where: { id: id, deletedAt: null },
    });

    if (!url) {
      this.logger.warn(
        `Update failed: URL ${id} not found (user ${userId})`,
        UrlShortenerServiceService.name,
      );
      throw new NotFoundException('URL not found');
    }

    if (url.userId !== userId) {
      this.logger.warn(
        `Unauthorized update attempt: user ${userId} tried to update URL ${id} owned by ${url.userId}`,
        UrlShortenerServiceService.name,
      );
      throw new ForbiddenException('Not allowed');
    }

    const updatedUrl = await this.prisma.url.update({
      where: { id: id },
      data: {
        longUrl: updateUrlDto.longUrl,
      },
    });

    this.logger.log(
      `User ${userId} updated URL ${id} to ${updateUrlDto.longUrl}`,
      UrlShortenerServiceService.name,
    );

    return {
      id: updatedUrl.id,
      longUrl: updatedUrl.longUrl,
      shortUrl: updatedUrl.shortUrl,
      userId: updatedUrl.userId,
      clicks: updatedUrl.clicks,
      createdAt: updatedUrl.createdAt,
      updatedAt: updatedUrl.updatedAt,
    };
  }

  async deleteUrl(id: string, userId: string): Promise<UrlResponseDto> {
    this.logger.log(
      `User ${userId} attempting to delete URL ${id}`,
      UrlShortenerServiceService.name,
    );

    const url = await this.prisma.url.findFirst({
      where: { id: id, deletedAt: null },
    });

    if (!url) {
      this.logger.warn(
        `Delete failed: URL ${id} not found (user ${userId})`,
        UrlShortenerServiceService.name,
      );
      throw new NotFoundException('URL not found');
    }

    if (url.userId !== userId) {
      this.logger.warn(
        `Unauthorized delete attempt: user ${userId} tried to delete URL ${id} owned by ${url.userId}`,
        UrlShortenerServiceService.name,
      );
      throw new ForbiddenException('Not allowed');
    }

    this.logger.log(
      `User ${userId} deleted URL ${id}`,
      UrlShortenerServiceService.name,
    );

    return this.prisma.url.update({
      where: { id: id },
      data: { deletedAt: new Date() },
    });
  }
}
