import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from '../../../src/posts/posts.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PostsService', () => {
  let service: PostsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    const userId = 'user-123';
    const createPostDto = {
      title: 'Test Post',
      content: 'Test Content',
    };

    it('should create a post successfully', async () => {
      const expectedPost = {
        id: 'post-123',
        ...createPostDto,
        authorId: userId,
        author: {
          username: 'testuser',
        },
      };

      mockPrismaService.post.create.mockResolvedValue(expectedPost);

      const result = await service.createPost(userId, createPostDto);

      expect(result).toEqual(expectedPost);
      expect(mockPrismaService.post.create).toHaveBeenCalledWith({
        data: {
          ...createPostDto,
          authorId: userId,
        },
        include: {
          author: {
            select: {
              username: true,
            },
          },
        },
      });
    });
  });

  describe('getPosts', () => {
    const mockPosts = [
      {
        id: 'post-1',
        title: 'Post 1',
        createdAt: new Date(),
        author: { username: 'user1' },
      },
      {
        id: 'post-2',
        title: 'Post 2',
        createdAt: new Date(),
        author: { username: 'user2' },
      },
    ];

    it('should return paginated posts', async () => {
      const page = 1;
      const total = 30;
      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);
      mockPrismaService.post.count.mockResolvedValue(total);

      const result = await service.getPosts(page);

      expect(result).toEqual({
        posts: mockPosts,
        total,
        page,
        totalPages: Math.ceil(total / 20),
      });
      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
        take: 20,
        skip: 0,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          author: {
            select: {
              username: true,
            },
          },
        },
      });
    });

    it('should handle pagination correctly', async () => {
      const page = 2;
      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);
      mockPrismaService.post.count.mockResolvedValue(30);

      await service.getPosts(page);

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 20,
        }),
      );
    });
  });

  describe('getPost', () => {
    const postId = 'post-123';
    const mockPost = {
      id: postId,
      title: 'Test Post',
      content: 'Test Content',
      author: {
        username: 'testuser',
      },
    };

    it('should return a post if it exists', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      const result = await service.getPost(postId);

      expect(result).toEqual(mockPost);
      expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
        include: {
          author: {
            select: {
              username: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if post does not exist', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.getPost(postId)).rejects.toThrow(NotFoundException);
    });
  });
});