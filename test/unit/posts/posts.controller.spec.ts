import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from '../../../src/posts/posts.controller';
import { PostsService } from '../../../src/posts/posts.service';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;

  const mockPostsService = {
    createPost: jest.fn(),
    getPosts: jest.fn(),
    getPost: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    const createPostDto = {
      title: 'Test Post',
      content: 'Test Content',
    };

    const mockRequest = {
      user: {
        id: 'user-123',
      },
    };

    it('should create a post successfully', async () => {
      const expectedPost = {
        id: 'post-123',
        ...createPostDto,
        authorId: mockRequest.user.id,
        author: {
          username: 'testuser',
        },
      };

      mockPostsService.createPost.mockResolvedValue(expectedPost);

      const result = await controller.createPost(mockRequest, createPostDto);

      expect(result).toEqual(expectedPost);
      expect(postsService.createPost).toHaveBeenCalledWith(
        mockRequest.user.id,
        createPostDto,
      );
    });
  });

  describe('getPosts', () => {
    const mockPaginatedPosts = {
      posts: [
        {
          id: 'post-1',
          title: 'Post 1',
          author: { username: 'user1' },
        },
      ],
      total: 30,
      page: 1,
      totalPages: 2,
    };

    it('should return paginated posts', async () => {
      mockPostsService.getPosts.mockResolvedValue(mockPaginatedPosts);

      const result = await controller.getPosts(1);

      expect(result).toEqual(mockPaginatedPosts);
      expect(postsService.getPosts).toHaveBeenCalledWith(1);
    });

    it('should handle undefined page parameter', async () => {
      const defaultPageResponse = { ...mockPaginatedPosts, page: 1 };
      mockPostsService.getPosts.mockResolvedValue(defaultPageResponse);

      const result = await controller.getPosts(undefined);

      expect(result).toEqual(defaultPageResponse);
      expect(postsService.getPosts).toHaveBeenCalledWith(1);
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

    it('should return a post by id', async () => {
      mockPostsService.getPost.mockResolvedValue(mockPost);

      const result = await controller.getPost(postId);

      expect(result).toEqual(mockPost);
      expect(postsService.getPost).toHaveBeenCalledWith(postId);
    });

    it('should propagate errors from postsService.getPost', async () => {
      const error = new Error('Post not found');
      mockPostsService.getPost.mockRejectedValue(error);

      await expect(controller.getPost(postId)).rejects.toThrow(error);
    });
  });
});
