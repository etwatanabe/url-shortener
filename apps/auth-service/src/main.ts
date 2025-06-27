import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.AUTH_SERVICE_PORT ?? 3001);
}
bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
  process.exit(1);
});
