import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UrlShortenerServiceModule } from '../src/url-shortener-service.module';

describe('UrlShortenerService (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UrlShortenerServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /shorten should create a short URL', async () => {
    const longUrl = 'https://www.example.com';
    const response = await request(app.getHttpServer())
      .post('/shorten')
      .send({ longUrl })
      .expect(201);

    type ShortenResponse = {
      id: string;
      longUrl: string;
      shortUrl: string;
      userId: string | null;
      clicks: number;
      createdAt?: string;
      updatedAt?: string;
    };

    const body = response.body as ShortenResponse;
    expect(body).toHaveProperty('id');
    expect(body.longUrl).toBe(longUrl);
    expect(typeof body.shortUrl).toBe('string');
    expect(body.clicks).toBe(0);
  });

  it('POST /shorten should fail with invalid URL', async () => {
    await request(app.getHttpServer())
      .post('/shorten')
      .send({ longUrl: 'invalid-url' })
      .expect(400);
  });
});
