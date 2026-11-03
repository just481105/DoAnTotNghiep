import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

type RequestWithUser = {
  headers: { authorization?: string };
  user?: { sub: string; email: string; role: string };
};

function createContext(request: RequestWithUser): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  const jwtService = { verifyAsync: jest.fn() };
  let guard: JwtAuthGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new JwtAuthGuard(jwtService as unknown as JwtService);
  });

  it('rejects requests without a bearer token', async () => {
    await expect(
      guard.canActivate(createContext({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects an invalid or expired token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('expired'));

    await expect(
      guard.canActivate(
        createContext({ headers: { authorization: 'Bearer invalid-token' } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('attaches the verified account to the request', async () => {
    const user = {
      sub: 'user-id',
      email: 'learner@example.com',
      role: 'STUDENT',
    };
    jwtService.verifyAsync.mockResolvedValue(user);
    const request: RequestWithUser = {
      headers: { authorization: 'Bearer signed-token' },
    };

    await expect(
      guard.canActivate(createContext(request)),
    ).resolves.toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('signed-token');
    expect(request.user).toEqual(user);
  });

  it('rejects tokens without a valid user subject', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      email: 'learner@example.com',
      role: 'STUDENT',
    });

    await expect(
      guard.canActivate(
        createContext({ headers: { authorization: 'Bearer malformed-token' } }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
