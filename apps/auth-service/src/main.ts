import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomLoggerService } from 'libs/custom-logger';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document);

  app.useLogger(app.get(CustomLoggerService));

  await app.listen(process.env.AUTH_SERVICE_PORT ?? 3001);
}
bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
  process.exit(1);
});
