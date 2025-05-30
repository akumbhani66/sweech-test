import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from '../../../src/comments/comments.controller';
import { CommentsService } from '../../../src/comments/comments.service';

describe('CommentsController', () => {
  let controller: CommentsController;
  let commentsService: CommentsService;

  const mockCommentsService = {
    createComment: jest.fn(),
    getComments: jest.fn(),
    deleteComment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    commentsService = module.get<CommentsService>(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    const postId = 'post-123';
    const mockRequest = {
      user: {
        id: 'user-123',
      },
    };
    const createCommentDto = {
      content: 'Test comment',
    };

    it('should create a comment successfully', async () => {
      const mockComment = {
        id: 'comment-123',
        content: createCommentDto.content,
        author: {
          username: 'testuser',
        },
      };

      mockCommentsService.createComment.mockResolvedValue(mockComment);

      const result = await controller.createComment(
        postId,
        mockRequest,
        createCommentDto,
      );

      expect(result).toEqual(mockComment);
      expect(commentsService.createComment).toHaveBeenCalledWith(
        postId,
        mockRequest.user.id,
        createCommentDto,
      );
    });

    it('should propagate errors from commentsService.createComment', async () => {
      const error = new Error('Failed to create comment');
      mockCommentsService.createComment.mockRejectedValue(error);

      await expect(
        controller.createComment(postId, mockRequest, createCommentDto),
      ).rejects.toThrow(error);
    });
  });

  describe('getComments', () => {
    const postId = 'post-123';
    const mockPaginatedComments = {
      comments: [
        {
          id: 'comment-1',
          content: 'Comment 1',
          author: { username: 'user1' },
        },
      ],
      nextCursor: 'comment-1',
    };

    it('should return comments without cursor', async () => {
      mockCommentsService.getComments.mockResolvedValue(mockPaginatedComments);

      const result = await controller.getComments(postId);

      expect(result).toEqual(mockPaginatedComments);
      expect(commentsService.getComments).toHaveBeenCalledWith(postId, undefined);
    });

    it('should return comments with cursor', async () => {
      const cursor = 'comment-1';
      mockCommentsService.getComments.mockResolvedValue(mockPaginatedComments);

      const result = await controller.getComments(postId, cursor);

      expect(result).toEqual(mockPaginatedComments);
      expect(commentsService.getComments).toHaveBeenCalledWith(postId, cursor);
    });

    it('should propagate errors from commentsService.getComments', async () => {
      const error = new Error('Failed to get comments');
      mockCommentsService.getComments.mockRejectedValue(error);

      await expect(controller.getComments(postId)).rejects.toThrow(error);
    });
  });

  describe('deleteComment', () => {
    const commentId = 'comment-123';
    const mockRequest = {
      user: {
        id: 'user-123',
      },
    };

    it('should delete comment successfully', async () => {
      const expectedResponse = { message: 'Comment deleted successfully' };
      mockCommentsService.deleteComment.mockResolvedValue(expectedResponse);

      const result = await controller.deleteComment(commentId, mockRequest);

      expect(result).toEqual(expectedResponse);
      expect(commentsService.deleteComment).toHaveBeenCalledWith(
        commentId,
        mockRequest.user.id,
      );
    });

    it('should propagate errors from commentsService.deleteComment', async () => {
      const error = new Error('Failed to delete comment');
      mockCommentsService.deleteComment.mockRejectedValue(error);

      await expect(
        controller.deleteComment(commentId, mockRequest),
      ).rejects.toThrow(error);
    });
  });
});