import { Test, TestingModule } from '@nestjs/testing';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthServiceController', () => {
  let controller: AuthServiceController;

  const mockService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
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
      mockService.register.mockResolvedValueOnce(mockResponse);

      const result = await controller.register(dto);
      expect(result).toEqual(mockResponse);
      expect(mockService.register).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException if email already registered', async () => {
      const dto: RegisterDto = {
        email: 'user@example.com',
        password: 'password123',
        name: 'Test User',
      };
      mockService.register.mockRejectedValueOnce(new ConflictException());

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
      mockService.login.mockResolvedValueOnce(mockResponse);

      const result = await controller.login(dto);
      expect(result).toEqual(mockResponse);
      expect(mockService.login).toHaveBeenCalledWith(dto);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const dto: LoginDto = {
        email: 'user@example.com',
        password: 'wrongpassword',
      };
      mockService.login.mockRejectedValueOnce(new UnauthorizedException());
      await expect(controller.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
