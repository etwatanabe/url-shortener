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

@Injectable()
export class UrlShortenerServiceService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateShortUrl(): Promise<string> {
    let shortUrl: string;

    do {
      shortUrl = randomBytes(4).toString('base64url').slice(0, 6);
    } while (
      await this.prisma.url.findFirst({
        where: { shortUrl: shortUrl, deletedAt: null },
      })
    );

    return shortUrl;
  }

  private normalizeUrl(url: string): string {
    url = url.trim();

    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    try {
      new URL(url);
    } catch {
      throw new BadRequestException('Invalid URL format');
    }

    return url;
  }

  private formatShortUrl(shortUrl: string): string {
    return `${process.env.BASE_URL ?? 'http://localhost:3000'}/${shortUrl}`;
  }

  async create(
    createUrlDto: CreateUrlDto,
    userId?: string,
  ): Promise<UrlResponseDto> {
    const { longUrl: inputUrl } = createUrlDto;

    const normalizedUrl = this.normalizeUrl(inputUrl);

    // const existingUrl = await this.prisma.url.findFirst({
    //   where: {
    //     longUrl: normalizedUrl,
    //     userId: userId ?? null,
    //     deletedAt: null,
    //   },
    // });

    // if (existingUrl) {
    //   return {
    //     id: existingUrl.id,
    //     longUrl: existingUrl.longUrl,
    //     shortUrl: this.formatShortUrl(existingUrl.shortUrl),
    //     userId: existingUrl.userId,
    //     clicks: existingUrl.clicks,
    //     createdAt: existingUrl.createdAt,
    //     updatedAt: existingUrl.updatedAt,
    //   };
    // }

    const shortUrl = await this.generateShortUrl();

    const url = await this.prisma.url.create({
      data: {
        userId: userId ?? null,
        longUrl: normalizedUrl,
        shortUrl: shortUrl,
      },
    });

    return {
      id: url.id,
      longUrl: url.longUrl,
      shortUrl: this.formatShortUrl(url.shortUrl),
      userId: url.userId,
      clicks: url.clicks,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    };
  }

  async findByShortUrl(shortUrl: string): Promise<UrlResponseDto> {
    const url = await this.prisma.url.findFirst({
      where: { shortUrl: shortUrl, deletedAt: null },
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

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
    const url = await this.findByShortUrl(shortUrl);

    this.prisma.url
      .update({
        where: { id: url.id },
        data: { clicks: { increment: 1 } },
      })
      .catch((error) => {
        console.error('Error updating click count:', error);
      });

    return url.longUrl;
  }

  async listUserUrls(userId: string): Promise<UrlStatsDto[]> {
    return this.prisma.url.findMany({
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
  }

  async deleteUrl(id: string, userId: string): Promise<UrlResponseDto> {
    const url = await this.prisma.url.findFirst({
      where: { id: id, deletedAt: null },
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

    if (url.userId !== userId) {
      throw new ForbiddenException('Not allowed');
    }

    return this.prisma.url.update({
      where: { id: id },
      data: { deletedAt: new Date() },
    });
  }
}
