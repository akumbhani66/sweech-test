import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DateTime } from 'luxon';

@Injectable()
export class LoginRecordsService {
  constructor(private prisma: PrismaService) {}

  async getLoginHistory(userId: string) {
    const records = await this.prisma.loginRecord.findMany({
      where: { userId },
      orderBy: { loginTime: 'desc' },
      take: 30,
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return records.map((record) => ({
      loginTime: DateTime.fromJSDate(record.loginTime).toFormat(
        'yyyy-MM-dd HH:mm:ss',
      ),
      ipAddress: record.ipAddress,
      username: record.user?.username || null,
    }));
  }

  async getWeeklyRankings() {
    // Get the start of the current week (Monday)
    const now = DateTime.now();
    const monday = now.startOf('week');
    const sunday = monday.plus({ days: 6 }).endOf('day');

    // Get login counts for the current week
    const loginCounts = await this.prisma.loginRecord.groupBy({
      by: ['userId'],
      where: {
        loginTime: {
          gte: monday.toJSDate(),
          lte: sunday.toJSDate(),
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 20,
    });

    // If no login records for the week, return empty rankings
    if (loginCounts.length === 0) {
      return {
        rankings: [],
        period: {
          start: monday.toISO(),
          end: sunday.toISO(),
        },
      };
    }

    // Get user details for the ranked users
    const userIds = loginCounts.map((count) => count.userId);
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        username: true,
      },
    });

    // Create a map of user IDs to usernames
    const userMap = new Map(users.map((user) => [user.id, user.username]));

    // Calculate rankings with ties
    let currentRank = 1;
    let currentCount = loginCounts[0]._count.id;
    let sameRankCount = 1;

    const rankings = loginCounts.map((record, index) => {
      const loginCount = record._count.id;

      if (loginCount < currentCount) {
        currentRank += sameRankCount;
        currentCount = loginCount;
        sameRankCount = 1;
      } else if (loginCount === currentCount) {
        sameRankCount++;
      }

      return {
        username: userMap.get(record.userId) || null,
        loginCount: loginCount,
        rank: currentRank,
      };
    });

    return {
      rankings,
      period: {
        start: monday.toISO(),
        end: sunday.toISO(),
      },
    };
  }
}
