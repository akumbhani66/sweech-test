import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from '../../../src/comments/comments.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    post: {
      findUnique: jest.fn(),
    },
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    const postId = 'post-123';
    const userId = 'user-123';
    const createCommentDto = {
      content: 'Test comment',
    };

    it('should create a comment successfully', async () => {
      const mockPost = { id: postId };
      const mockComment = {
        id: 'comment-123',
        content: createCommentDto.content,
        postId,
        authorId: userId,
        author: {
          username: 'testuser',
        },
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.comment.create.mockResolvedValue(mockComment);

      const result = await service.createComment(
        postId,
        userId,
        createCommentDto,
      );

      expect(result).toEqual(mockComment);
      expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
      });
      expect(mockPrismaService.comment.create).toHaveBeenCalledWith({
        data: {
          content: createCommentDto.content,
          postId,
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

    it('should throw NotFoundException if post does not exist', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(
        service.createComment(postId, userId, createCommentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getComments', () => {
    const postId = 'post-123';
    const mockComments = [
      {
        id: 'comment-1',
        content: 'Comment 1',
        author: { username: 'user1' },
      },
      {
        id: 'comment-2',
        content: 'Comment 2',
        author: { username: 'user2' },
      },
    ];

    it('should return paginated comments without cursor', async () => {
      mockPrismaService.comment.findMany.mockResolvedValue(mockComments);

      const result = await service.getComments(postId);

      expect(result).toEqual({
        comments: mockComments,
        nextCursor: null,
      });
      expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
        take: 10,
        where: { postId },
        orderBy: {
          createdAt: 'desc',
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

    it('should handle cursor-based pagination', async () => {
      const cursor = 'comment-1';
      mockPrismaService.comment.findMany.mockResolvedValue(mockComments);

      await service.getComments(postId, cursor);

      expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
        take: 10,
        where: { postId },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: {
              username: true,
            },
          },
        },
        cursor: { id: cursor },
        skip: 1,
      });
    });

    it('should return null nextCursor when no more comments', async () => {
      mockPrismaService.comment.findMany.mockResolvedValue([mockComments[0]]);

      const result = await service.getComments(postId);

      expect(result.nextCursor).toBeNull();
    });

    it('should return nextCursor when there are more comments', async () => {
      const manyComments = Array.from({ length: 10 }, (_, i) => ({
        id: `comment-${i + 1}`,
        content: `Comment ${i + 1}`,
        author: { username: 'user1' },
      }));
      mockPrismaService.comment.findMany.mockResolvedValue(manyComments);

      const result = await service.getComments(postId);

      expect(result.nextCursor).toBe(manyComments[manyComments.length - 1].id);
    });
  });

  describe('deleteComment', () => {
    const commentId = 'comment-123';
    const userId = 'user-123';

    it('should delete comment when user is the author', async () => {
      const mockComment = {
        id: commentId,
        authorId: userId,
        post: {
          authorId: 'other-user',
        },
      };

      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);
      mockPrismaService.comment.delete.mockResolvedValue(mockComment);

      const result = await service.deleteComment(commentId, userId);

      expect(result).toEqual({ message: 'Comment deleted successfully' });
      expect(mockPrismaService.comment.delete).toHaveBeenCalledWith({
        where: { id: commentId },
      });
    });

    it('should delete comment when user is the post author', async () => {
      const mockComment = {
        id: commentId,
        authorId: 'other-user',
        post: {
          authorId: userId,
        },
      };

      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);
      mockPrismaService.comment.delete.mockResolvedValue(mockComment);

      const result = await service.deleteComment(commentId, userId);

      expect(result).toEqual({ message: 'Comment deleted successfully' });
    });

    it('should throw NotFoundException if comment does not exist', async () => {
      mockPrismaService.comment.findUnique.mockResolvedValue(null);

      await expect(service.deleteComment(commentId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
      const mockComment = {
        id: commentId,
        authorId: 'other-user',
        post: {
          authorId: 'another-user',
        },
      };

      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);

      await expect(service.deleteComment(commentId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
