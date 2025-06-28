import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthServiceModule } from '../src/auth-service.module';

describe('AuthServiceController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthServiceModule],
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

  const user = {
    email: `authE2ETest${Date.now()}@example.com`,
    password: 'password123',
    name: 'Auth E2E Test User',
  };

  type AuthResponse = {
    accessToken: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  };

  it('POST /auth/register - should register a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);

    expect(response.body as AuthResponse).toHaveProperty('accessToken');
    expect((response.body as AuthResponse).user).toMatchObject({
      email: user.email,
      name: user.name,
    });
  });

  it('POST /auth/register - should not allow duplicate email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(409);
  });

  it('POST /auth/login - should login with correct credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(200);

    expect(response.body as AuthResponse).toHaveProperty('accessToken');
    expect((response.body as AuthResponse).user).toMatchObject({
      email: user.email,
      name: user.name,
    });
  });

  it('POST /auth/login - should fail with wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: 'wrongpassword' })
      .expect(401);
  });

  it('POST /auth/login - should fail with non-existent user', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nouser@example.com', password: 'password123' })
      .expect(401);
  });
});
