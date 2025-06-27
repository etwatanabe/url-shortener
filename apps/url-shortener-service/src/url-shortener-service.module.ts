import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UrlShortenerServiceController } from './url-shortener-service.controller';
import { UrlShortenerServiceService } from './url-shortener-service.service';
import { PrismaModule } from 'libs/prisma';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  controllers: [UrlShortenerServiceController],
  providers: [UrlShortenerServiceService],
})
export class UrlShortenerServiceModule {}
