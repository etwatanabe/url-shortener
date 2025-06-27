import { Test, TestingModule } from '@nestjs/testing';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthServiceController', () => {
  let controller: AuthServiceController;
  let service: AuthServiceService;

  beforeEach(async () => {
    const mockService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthServiceController],
      providers: [
        {
          provide: AuthServiceService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AuthServiceController>(AuthServiceController);
    service = module.get<AuthServiceService>(AuthServiceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto: RegisterDto = {
        email: 'user@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const mockResponse = {
        accessToken: 'token',
        user: { id: '1', email: dto.email, name: dto.name },
      };
      jest.spyOn(service, 'register').mockResolvedValueOnce(mockResponse);

      const result = await controller.register(dto);
      expect(result).toEqual(mockResponse);
      expect(service.register).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException if email already registered', async () => {
      const dto: RegisterDto = {
        email: 'user@example.com',
        password: 'password123',
        name: 'Test User',
      };
      jest
        .spyOn(service, 'register')
        .mockRejectedValueOnce(new ConflictException());

      await expect(controller.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const dto: LoginDto = {
        email: 'user@example.com',
        password: 'password123',
      };
      const mockResponse = {
        accessToken: 'token',
        user: { id: '1', email: dto.email, name: 'Test User' },
      };
      jest.spyOn(service, 'login').mockResolvedValueOnce(mockResponse);

      const result = await controller.login(dto);
      expect(result).toEqual(mockResponse);
      expect(service.login).toHaveBeenCalledWith(dto);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const dto: LoginDto = {
        email: 'user@example.com',
        password: 'wrongpassword',
      };
      jest
        .spyOn(service, 'login')
        .mockRejectedValueOnce(new UnauthorizedException());

      await expect(controller.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
