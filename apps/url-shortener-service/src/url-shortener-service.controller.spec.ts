import { Test, TestingModule } from '@nestjs/testing';
import { UrlShortenerServiceController } from './url-shortener-service.controller';
import { UrlShortenerServiceService } from './url-shortener-service.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { NotFoundException } from '@nestjs/common';

describe('UrlShortenerServiceController', () => {
  let controller: UrlShortenerServiceController;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn().mockImplementation((dto: CreateUrlDto) => ({
        id: 'test-id',
        longUrl: dto.longUrl,
        shortUrl: 'http://localhost:3000/abc123',
        userId: null,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      redirect: jest.fn().mockImplementation((shortUrl: string) => {
        if (shortUrl === 'abc123') return 'https://example.com';
        throw new NotFoundException();
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlShortenerServiceController],
      providers: [
        {
          provide: UrlShortenerServiceService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UrlShortenerServiceController>(
      UrlShortenerServiceController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a short URL', async () => {
    const dto: CreateUrlDto = { longUrl: 'https://example.com' };
    const result = await controller.shorten(dto);
    expect(result).toHaveProperty('id', 'test-id');
    expect(result).toHaveProperty('longUrl', dto.longUrl);
    expect(result).toHaveProperty('shortUrl', 'http://localhost:3000/abc123');
    expect(result).toHaveProperty('clicks', 0);
  });

  it('should redirect to the original URL', async () => {
    const param = 'abc123';
    const result = await controller.redirect(param);
    expect(result).toEqual({ url: 'https://example.com' });
  });

  it('should throw NotFoundException if shortUrl does not exist', async () => {
    await expect(controller.redirect('notfound')).rejects.toThrow(
      NotFoundException,
    );
  });
});
