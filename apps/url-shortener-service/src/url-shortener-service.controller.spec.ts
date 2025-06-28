import { Test, TestingModule } from '@nestjs/testing';
import { UrlShortenerServiceController } from './url-shortener-service.controller';
import { UrlShortenerServiceService } from './url-shortener-service.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('UrlShortenerServiceController', () => {
  let controller: UrlShortenerServiceController;

  beforeEach(async () => {
    const mockService = {
      create: jest
        .fn()
        .mockImplementation((dto: CreateUrlDto, userId?: string) => ({
          id: 'test-id',
          longUrl: dto.longUrl,
          shortUrl: 'http://localhost:3000/abc123',
          userId: userId ?? null,
          clicks: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      redirect: jest.fn().mockImplementation((shortUrl: string) => {
        if (shortUrl === 'abc123') return 'https://example.com';
        throw new NotFoundException();
      }),
      listUserUrls: jest.fn().mockResolvedValue([
        {
          id: 'test-id',
          longUrl: 'https://example.com',
          shortUrl: 'http://localhost:3000/abc123',
          clicks: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
      updateUrl: jest
        .fn()
        .mockImplementation((id: string, dto: UpdateUrlDto, userId: string) => {
          if (id !== 'test-id') throw new NotFoundException();
          if (userId !== 'user-1') throw new ForbiddenException();
          return {
            id,
            longUrl: dto.longUrl,
            shortUrl: 'http://localhost:3000/abc123',
            userId,
            clicks: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }),
      deleteUrl: jest.fn().mockImplementation((id: string, userId: string) => {
        if (id !== 'test-id') throw new NotFoundException();
        if (userId !== 'user-1') throw new ForbiddenException();
        return {
          id,
          longUrl: 'https://example.com',
          shortUrl: 'http://localhost:3000/abc123',
          userId,
          clicks: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
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
    const result = await controller.shorten(dto, undefined);
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

  it('should list user URLs', async () => {
    const result = await controller.listUserUrls('user-1');
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('id', 'test-id');
  });

  it('should update a user URL', async () => {
    const dto: UpdateUrlDto = { longUrl: 'https://updated.com' };
    const result = await controller.updateUrl('test-id', dto, 'user-1');
    expect(result).toHaveProperty('longUrl', dto.longUrl);
  });

  it('should throw ForbiddenException if updating with wrong user', async () => {
    const dto: UpdateUrlDto = { longUrl: 'https://updated.com' };
    await expect(
      controller.updateUrl('test-id', dto, 'wrong-user'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should delete a user URL', async () => {
    const result = await controller.deleteUrl('test-id', 'user-1');
    expect(result).toHaveProperty('id', 'test-id');
  });

  it('should throw ForbiddenException if deleting with wrong user', async () => {
    await expect(controller.deleteUrl('test-id', 'wrong-user')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
