import { NestFactory } from "@nestjs/core";
import { AppModule } from "./url-shortener-service.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle("API")
    .setDescription("API documentation")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup("docs", app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
  console.error("Error during application bootstrap:", error);
  process.exit(1);
});