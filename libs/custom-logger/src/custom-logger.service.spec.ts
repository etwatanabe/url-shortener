import { Test, TestingModule } from '@nestjs/testing';
import { CustomLoggerService } from './custom-logger.service';
import { LoggerModule } from 'nestjs-pino';

describe('CustomLoggerService', () => {
  let service: CustomLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({
          pinoHttp: {
            transport: {
              target: 'pino-pretty',
              options: { singleLine: true },
            },
            level: 'debug',
          },
        }),
      ],
      providers: [CustomLoggerService],
    }).compile();

    service = module.get<CustomLoggerService>(CustomLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
