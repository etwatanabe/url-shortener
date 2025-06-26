import { Controller, Get } from '@nestjs/common';
import { UrlShortenerServiceService } from './url-shortener-service.service';

@Controller()
export class UrlShortenerServiceController {
  constructor(private readonly urlShortenerService: UrlShortenerServiceService) {}

  @Get()
  getHello(): string {
    return this.urlShortenerService.getHello();
  }
}
