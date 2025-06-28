import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UrlShortenerServiceModule } from '../src/url-shortener-service.module';
import { UrlResponseDto } from '../src/dto/url-response.dto';

describe('UrlShortenerService (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;
  let urlId: string;

  type AuthResponse = {
    accessToken: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UrlShortenerServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    // Create a user and login in the auth-service to get a token
    const user = {
      email: `UrlShortenerE2ETest${Date.now()}@example.com`,
      password: 'password123',
      name: 'UrlShortener E2E Test User',
    };

    // Register user
    const registerRes = await request('http://localhost:3001')
      .post('/auth/register')
      .send(user)
      .expect(201);

    expect(registerRes.body).toHaveProperty('accessToken');
    expect(registerRes.body).toHaveProperty('user');

    // Login
    const loginRes = await request('http://localhost:3001')
      .post('/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(200);

    expect(loginRes.body).toHaveProperty('accessToken');
    expect(loginRes.body).toHaveProperty('user');

    accessToken = (loginRes.body as AuthResponse).accessToken;
    userId = (loginRes.body as AuthResponse).user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /shorten should create a short URL linked to the authenticated user', async () => {
    const longUrl = 'https://www.e2e-test.com';
    const response = await request(app.getHttpServer())
      .post('/shorten')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ longUrl: longUrl })
      .expect(201);

    const url = response.body as UrlResponseDto;

    expect(url.userId).toBe(userId);
    expect(url.longUrl).toBe(longUrl);
    urlId = url.id;
  });

  it('GET /urls should list URLs for the authenticated user', async () => {
    const response = await request(app.getHttpServer())
      .get('/urls')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const urls = response.body as UrlResponseDto[];

    expect(Array.isArray(urls)).toBe(true);
    expect(urls.length).toBeGreaterThan(0);
    expect(urls.some((u) => u.id === urlId)).toBe(true);
  });

  it("PATCH /urls/:id should update the user's URL", async () => {
    const newUrl = 'https://www.e2e-updated.com';
    const response = await request(app.getHttpServer())
      .patch(`/urls/${urlId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ longUrl: newUrl })
      .expect(200);

    const url = response.body as UrlResponseDto;

    expect(url.longUrl).toBe(newUrl);
  });

  it("DELETE /urls/:id should logically delete the user's URL", async () => {
    const response = await request(app.getHttpServer())
      .delete(`/urls/${urlId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const url = response.body as UrlResponseDto;

    expect(url.id).toBe(urlId);
  });

  it('GET /urls should not return deleted URLs', async () => {
    const response = await request(app.getHttpServer())
      .get('/urls')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const urls = response.body as UrlResponseDto[];

    expect(urls.find((u) => u.id === urlId)).toBeUndefined();
  });

  it('POST /shorten should create an anonymous short URL', async () => {
    const longUrl = 'https://www.anon-test.com';
    const response = await request(app.getHttpServer())
      .post('/shorten')
      .send({ longUrl })
      .expect(201);

    const url = response.body as UrlResponseDto;

    expect(url.userId).toBeNull();
    expect(url.longUrl).toBe(longUrl);
  });

  it('POST /shorten should fail with invalid URL', async () => {
    await request(app.getHttpServer())
      .post('/shorten')
      .send({ longUrl: 'invalid-url' })
      .expect(400);
  });
});
