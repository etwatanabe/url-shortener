import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UrlShortenerServiceController } from './url-shortener-service.controller';
import { UrlShortenerServiceService } from './url-shortener-service.service';
import { PrismaModule } from 'libs/prisma';
import { JwtStrategy } from 'libs/auth';
import { CustomLoggerModule } from 'libs/custom-logger';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CustomLoggerModule,
  ],
  controllers: [UrlShortenerServiceController],
  providers: [UrlShortenerServiceService, JwtStrategy],
})
export class UrlShortenerServiceModule {}
