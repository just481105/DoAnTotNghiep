import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (Buffer.byteLength(dto.password, 'utf8') > 72) {
      throw new BadRequestException('Mật khẩu không được dài quá 72 byte.');
    }

    const email = dto.email.trim().toLowerCase();
    const passwordHash = await hash(dto.password, BCRYPT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName: dto.fullName?.trim() || null,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
        },
      });

      return this.createSession(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email này đã được đăng ký.');
      }

      throw error;
    }
  }

  async login(dto: LoginDto) {
    if (Buffer.byteLength(dto.password, 'utf8') > 72) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác.');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        fullName: true,
        role: true,
      },
    });

    if (!user || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác.');
    }

    return this.createSession({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  }

  private async createSession(user: {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
  }) {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token: accessToken,
      user,
    };
  }
}
