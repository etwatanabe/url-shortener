import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user and returns an access token.',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      example: {
        summary: 'Register user',
        value: {
          email: 'user@example.com',
          password: 'password123',
          name: 'John Doe',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
    examples: {
      success: {
        summary: 'Success',
        value: {
          accessToken: 'jwt.token.here',
          user: {
            id: 'user-id',
            email: 'user@example.com',
            name: 'John Doe',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email already registered',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email already registered',
        error: 'Conflict',
      },
    },
  })
  async register(
    @Body(ValidationPipe) registerDto: RegisterDto,
  ): Promise<AuthResponseDto> {
    return this.authServiceService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates a user and returns an access token.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      example: {
        summary: 'Login user',
        value: {
          email: 'user@example.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    type: AuthResponseDto,
    examples: {
      success: {
        summary: 'Success',
        value: {
          accessToken: 'jwt.token.here',
          user: {
            id: 'user-id',
            email: 'user@example.com',
            name: 'John Doe',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      },
    },
  })
  async login(
    @Body(ValidationPipe) loginDto: LoginDto,
  ): Promise<AuthResponseDto> {
    return this.authServiceService.login(loginDto);
  }
}
