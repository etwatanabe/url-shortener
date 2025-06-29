import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'libs/prisma';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CustomLoggerService } from 'libs/custom-logger';

@Injectable()
export class AuthServiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly logger: CustomLoggerService,
  ) {}

  private generateToken(user: { id: string; email: string }) {
    const payload = { email: user.email, id: user.id };
    return this.jwtService.sign(payload);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name } = registerDto;

    this.logger.log(
      `Attempting to register user: ${email}`,
      AuthServiceService.name,
    );

    const existingUser = await this.prisma.user.findFirst({
      where: { email: email, deletedAt: null },
    });
    if (existingUser) {
      this.logger.warn(
        `Register failed: Email ${email} already registered`,
        AuthServiceService.name,
      );
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: name,
      },
    });

    this.logger.log(
      `User registered successfully: ${email} (id: ${user.id})`,
      AuthServiceService.name,
    );

    const accessToken = this.generateToken(user);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;
    this.logger.log(
      `Attempting to login user: ${email}`,
      AuthServiceService.name,
    );

    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    if (!user) {
      this.logger.warn(
        `Login failed: User with email ${email} not found`,
        AuthServiceService.name,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(
        `Login failed: Invalid password for user ${email}`,
        AuthServiceService.name,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateToken(user);

    this.logger.log(
      `Login successful for user ${email}`,
      AuthServiceService.name,
    );

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
