import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  /** Cộng XP và cập nhật streak. Chỉ gọi từ server, không nhận số từ client. */
  async award(userId: string, xp: number) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { streakDays: true, lastStudiedAt: true },
    });

    const now = new Date();
    const today = startOfDay(now).getTime();
    let streakDays = user.streakDays;

    if (!user.lastStudiedAt) {
      streakDays = 1;
    } else {
      const diffDays = Math.round(
        (today - startOfDay(user.lastStudiedAt).getTime()) / DAY_MS,
      );
      if (diffDays === 1) streakDays += 1;
      else if (diffDays > 1) streakDays = 1;
      // diffDays === 0: cùng ngày, giữ nguyên
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { xpPoints: { increment: xp }, streakDays, lastStudiedAt: now },
      select: { xpPoints: true, streakDays: true },
    });
  }
}
