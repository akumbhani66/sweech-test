import { Test, TestingModule } from '@nestjs/testing';
import { LoginRecordsService } from '../../../src/login-records/login-records.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { DateTime } from 'luxon';

describe('LoginRecordsService', () => {
  let service: LoginRecordsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    loginRecord: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginRecordsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LoginRecordsService>(LoginRecordsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLoginHistory', () => {
    const userId = 'user-123';
    const mockLoginRecords = [
      {
        loginTime: new Date('2024-03-10T10:00:00Z'),
        ipAddress: '192.168.1.1',
        user: {
          username: 'testuser',
        },
      },
      {
        loginTime: new Date('2024-03-09T15:30:00Z'),
        ipAddress: '192.168.1.2',
        user: {
          username: 'testuser',
        },
      },
    ];

    it('should return formatted login history', async () => {
      mockPrismaService.loginRecord.findMany.mockResolvedValue(
        mockLoginRecords,
      );

      const result = await service.getLoginHistory(userId);

      expect(result).toEqual([
        {
          loginTime: DateTime.fromJSDate(
            mockLoginRecords[0].loginTime,
          ).toFormat('yyyy-MM-dd HH:mm:ss'),
          ipAddress: mockLoginRecords[0].ipAddress,
          username: mockLoginRecords[0].user.username,
        },
        {
          loginTime: DateTime.fromJSDate(
            mockLoginRecords[1].loginTime,
          ).toFormat('yyyy-MM-dd HH:mm:ss'),
          ipAddress: mockLoginRecords[1].ipAddress,
          username: mockLoginRecords[1].user.username,
        },
      ]);

      expect(mockPrismaService.loginRecord.findMany).toHaveBeenCalledWith({
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
    });

    it('should handle null username', async () => {
      const recordsWithNullUser = [
        {
          loginTime: new Date('2024-03-10T10:00:00Z'),
          ipAddress: '192.168.1.1',
          user: null,
        },
      ];

      mockPrismaService.loginRecord.findMany.mockResolvedValue(
        recordsWithNullUser,
      );

      const result = await service.getLoginHistory(userId);

      expect(result[0].username).toBeNull();
    });
  });

  describe('getWeeklyRankings', () => {
    const mockLoginCounts = [
      { userId: 'user1', _count: { id: 10 } },
      { userId: 'user2', _count: { id: 8 } },
      { userId: 'user3', _count: { id: 8 } },
      { userId: 'user4', _count: { id: 5 } },
    ];

    const mockUsers = [
      { id: 'user1', username: 'User One' },
      { id: 'user2', username: 'User Two' },
      { id: 'user3', username: 'User Three' },
      { id: 'user4', username: 'User Four' },
    ];

    it('should return weekly rankings with correct rank calculation', async () => {
      mockPrismaService.loginRecord.groupBy.mockResolvedValue(mockLoginCounts);
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getWeeklyRankings();

      expect(result.rankings).toEqual([
        { username: 'User One', loginCount: 10, rank: 1 },
        { username: 'User Two', loginCount: 8, rank: 3 },
        { username: 'User Three', loginCount: 8, rank: 3 },
        { username: 'User Four', loginCount: 5, rank: 5 },
      ]);

      expect(result.period).toBeDefined();
      expect(result.period.start).toBeDefined();
      expect(result.period.end).toBeDefined();
    });

    it('should handle empty rankings', async () => {
      mockPrismaService.loginRecord.groupBy.mockResolvedValue([]);

      const result = await service.getWeeklyRankings();

      expect(result.rankings).toEqual([]);
      expect(result.period).toBeDefined();
      expect(result.period.start).toBeDefined();
      expect(result.period.end).toBeDefined();
    });

    it('should handle missing users', async () => {
      mockPrismaService.loginRecord.groupBy.mockResolvedValue([
        { userId: 'nonexistent', _count: { id: 5 } },
      ]);
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.getWeeklyRankings();

      expect(result.rankings[0].username).toBeNull();
      expect(result.rankings[0].loginCount).toBe(5);
      expect(result.rankings[0].rank).toBe(1);
    });
  });
});
