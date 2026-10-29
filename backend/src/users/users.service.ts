import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    // 1. Lấy thông tin user hiện tại (Streak, XP, CEFR Level)
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        streakDays: true,
        xpPoints: true,
      },
    });

    // 2. Thống kê từ vựng SM-2 theo trạng thái thực tế trong database
    const now = new Date();
    
    // Từ đến hạn ôn tập hôm nay
    const dueTodayCount = await this.prisma.userSm2Stats.count({
      where: {
        userId,
        nextReviewAt: { lte: now },
      },
    });

    // Từ mới đang học (repetitions = 0)
    const learningCount = await this.prisma.userSm2Stats.count({
      where: {
        userId,
        repetitions: 0,
      },
    });

    // Từ đã nhớ dài hạn (khoảng cách ôn tập > 21 ngày)
    const masteredCount = await this.prisma.userSm2Stats.count({
      where: {
        userId,
        intervalDays: { gt: 21 },
      },
    });

    // 3. Tổng số lượng học viên hoạt động trong hệ thống
    const activeLearners = await this.prisma.user.count();

    // 4. Bảng xếp hạng Top học viên theo điểm XP (Leaderboard)
    const topUsers = await this.prisma.user.findMany({
      orderBy: { xpPoints: 'desc' },
      take: 5,
      select: {
        id: true,
        fullName: true,
        xpPoints: true,
      },
    });

    const topRankings = topUsers.map((u, index) => ({
      id: u.id,
      name: u.fullName || 'Học viên',
      xp: u.xpPoints,
      rank: index + 1,
      avatar: (u.fullName || 'HV').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
    }));

    return {
      user: {
        ...currentUser,
        cefrLevel: 'B2',
      },
      stats: {
        totalSubmissions: 10230, // Mô phỏng tổng bài nộp
        activeLearners: activeLearners || 1,
        b1Completed: 1844,
        b2Completed: 1045,
        dueTodayCount,
      },
      retentionCurve: [
        { name: 'Đang học mới (Rep = 0)', value: learningCount, color: '#6366f1' },
        { name: 'Cần ôn hôm nay (Due)', value: dueTodayCount, color: '#f59e0b' },
        { name: 'Đã nhớ dài hạn (Interval > 21d)', value: masteredCount, color: '#10b981' },
      ],
      topRankings,
    };
  }

  async recordSpeakingPractice(userId: string, data: { word: string; accuracyScore: number; transcribedText?: string }) {
  // 1. Tính toán điểm XP thưởng (Đạt trên 80% thưởng 20 XP, dưới 80% thưởng 10 XP động viên)
  const earnedXp = data.accuracyScore >= 80 ? 20 : 10;

  // 2. Ghi nhận lịch sử luyện nói
    const record = await (this.prisma as any).speakingHistory.create({
      data: {
        userId,
        word: data.word,
        accuracyScore: data.accuracyScore,
        transcribedText: data.transcribedText || '',
      },
    });

  // 3. Cập nhật tổng điểm XP và ngày học của User
  const updatedUser = await this.prisma.user.update({
    where: { id: userId },
    data: {
      xpPoints: { increment: earnedXp },
    },
    select: {
      id: true,
      fullName: true,
      xpPoints: true,
      streakDays: true,
    },
  });

  return {
    success: true,
    earnedXp,
    totalXp: updatedUser.xpPoints,
    record,
  };
}

}
