import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../src/auth/auth.controller';
import { AuthService } from '../../../src/auth/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signUp: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    const signUpDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      username: 'testuser',
    };

    it('should call authService.signUp with correct parameters', async () => {
      const expectedResponse = { message: 'User created successfully' };
      mockAuthService.signUp.mockResolvedValue(expectedResponse);

      const result = await controller.signUp(signUpDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
      expect(authService.signUp).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from authService.signUp', async () => {
      const error = new Error('SignUp failed');
      mockAuthService.signUp.mockRejectedValue(error);

      await expect(controller.signUp(signUpDto)).rejects.toThrow(error);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    };

    it('should call authService.login with correct parameters', async () => {
      const expectedResponse = { access_token: 'mock.jwt.token' };
      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto, mockUser.id);

      expect(result).toEqual(expectedResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto, mockUser.id);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from authService.login', async () => {
      const error = new Error('Login failed');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto, mockUser.id)).rejects.toThrow(
        error,
      );
    });
  });
});
