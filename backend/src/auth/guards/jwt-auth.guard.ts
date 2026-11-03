import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: string;
}

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  if (typeof value !== 'object' || value === null) return false;

  return (
    'sub' in value &&
    typeof value.sub === 'string' &&
    value.sub.length > 0 &&
    'email' in value &&
    typeof value.email === 'string' &&
    'role' in value &&
    typeof value.role === 'string'
  );
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const match =
      typeof authorization === 'string'
        ? /^Bearer\s+(\S+)$/i.exec(authorization)
        : null;

    if (!match) {
      throw new UnauthorizedException('A valid bearer token is required.');
    }

    let payload: unknown;
    try {
      payload = await this.jwtService.verifyAsync<Record<string, unknown>>(
        match[1],
      );
    } catch {
      throw new UnauthorizedException('The access token is invalid or expired.');
    }

    if (!isAuthenticatedUser(payload)) {
      throw new UnauthorizedException('The access token has an invalid payload.');
    }

    request.user = payload;
    return true;
  }
}
