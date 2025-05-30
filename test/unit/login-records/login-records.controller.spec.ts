import { Test, TestingModule } from '@nestjs/testing';
import { LoginRecordsController } from '../../../src/login-records/login-records.controller';
import { LoginRecordsService } from '../../../src/login-records/login-records.service';

describe('LoginRecordsController', () => {
  let controller: LoginRecordsController;
  let loginRecordsService: LoginRecordsService;

  const mockLoginRecordsService = {
    getLoginHistory: jest.fn(),
    getWeeklyRankings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginRecordsController],
      providers: [
        {
          provide: LoginRecordsService,
          useValue: mockLoginRecordsService,
        },
      ],
    }).compile();

    controller = module.get<LoginRecordsController>(LoginRecordsController);
    loginRecordsService = module.get<LoginRecordsService>(LoginRecordsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLoginHistory', () => {
    const mockRequest = {
      user: {
        id: 'user-123',
      },
    };

    const mockLoginHistory = [
      {
        loginTime: '2024-03-10 10:00:00',
        ipAddress: '192.168.1.1',
        username: 'testuser',
      },
    ];

    it('should return login history for the authenticated user', async () => {
      mockLoginRecordsService.getLoginHistory.mockResolvedValue(mockLoginHistory);

      const result = await controller.getLoginHistory(mockRequest);

      expect(result).toEqual(mockLoginHistory);
      expect(loginRecordsService.getLoginHistory).toHaveBeenCalledWith(mockRequest.user.id);
    });

    it('should propagate errors from loginRecordsService.getLoginHistory', async () => {
      const error = new Error('Failed to get login history');
      mockLoginRecordsService.getLoginHistory.mockRejectedValue(error);

      await expect(controller.getLoginHistory(mockRequest)).rejects.toThrow(error);
    });
  });

  describe('getWeeklyRankings', () => {
    const mockRankings = {
      rankings: [
        { username: 'User One', loginCount: 10, rank: 1 },
        { username: 'User Two', loginCount: 8, rank: 2 },
      ],
      period: {
        start: '2024-03-04T00:00:00.000Z',
        end: '2024-03-10T23:59:59.999Z',
      },
    };

    it('should return weekly rankings', async () => {
      mockLoginRecordsService.getWeeklyRankings.mockResolvedValue(mockRankings);

      const result = await controller.getWeeklyRankings();

      expect(result).toEqual(mockRankings);
      expect(loginRecordsService.getWeeklyRankings).toHaveBeenCalled();
    });

    it('should propagate errors from loginRecordsService.getWeeklyRankings', async () => {
      const error = new Error('Failed to get weekly rankings');
      mockLoginRecordsService.getWeeklyRankings.mockRejectedValue(error);

      await expect(controller.getWeeklyRankings()).rejects.toThrow(error);
    });
  });
});