import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import { compare, hash } from 'bcryptjs';

describe('AuthService', () => {
  const prisma = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  const jwtService = {
    signAsync: jest.fn(),
  };
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
    (hash as jest.Mock).mockResolvedValue('hashed-password');
    jwtService.signAsync.mockResolvedValue('signed-token');
  });

  it('creates an account and returns a token without its password hash', async () => {
    prisma.user.create.mockResolvedValue({
      id: 'user-id',
      email: 'learner@example.com',
      fullName: 'Learner',
      role: 'STUDENT',
    });

    await expect(
      service.register({
        email: ' Learner@Example.com ',
        password: 'a-secure-password',
        fullName: ' Learner ',
      }),
    ).resolves.toEqual({
      access_token: 'signed-token',
      user: {
        id: 'user-id',
        email: 'learner@example.com',
        fullName: 'Learner',
        role: 'STUDENT',
      },
    });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          email: 'learner@example.com',
          passwordHash: 'hashed-password',
          fullName: 'Learner',
        },
      }),
    );
  });

  it('reports a duplicate email', async () => {
    prisma.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Duplicate email', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.register({
        email: 'learner@example.com',
        password: 'a-secure-password',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('authenticates a user and returns a token without the password hash', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      email: 'learner@example.com',
      passwordHash: 'hashed-password',
      fullName: 'Learner',
      role: 'STUDENT',
    });
    (compare as jest.Mock).mockResolvedValue(true);

    await expect(
      service.login({
        email: ' Learner@Example.com ',
        password: 'a-secure-password',
      }),
    ).resolves.toEqual({
      access_token: 'signed-token',
      user: {
        id: 'user-id',
        email: 'learner@example.com',
        fullName: 'Learner',
        role: 'STUDENT',
      },
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-id',
      email: 'learner@example.com',
      role: 'STUDENT',
    });
  });

  it('rejects invalid credentials without returning account details', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      email: 'learner@example.com',
      passwordHash: 'hashed-password',
      fullName: 'Learner',
      role: 'STUDENT',
    });
    (compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({
        email: 'learner@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
