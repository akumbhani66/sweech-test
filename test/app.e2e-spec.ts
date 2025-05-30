import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prismaService = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // Clean the database before each test
    await prismaService.post.deleteMany();
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    await prismaService.post.deleteMany();
    await prismaService.user.deleteMany();
    await app.close();
  });

  describe('Auth', () => {
    const signupDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    describe('/auth/signup (POST)', () => {
      it('should create a new user', () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send(signupDto)
          .expect(201)
          .expect(({ body }) => {
            expect(body.message).toBe('User created successfully');
          });
      });

      it('should fail if user already exists', async () => {
        await request(app.getHttpServer())
          .post('/auth/signup')
          .send(signupDto)
          .expect(201);

        return request(app.getHttpServer())
          .post('/auth/signup')
          .send(signupDto)
          .expect(409);
      });
    });

    describe('/auth/login (POST)', () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post('/auth/signup')
          .send(signupDto);
      });

      it('should login successfully', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: signupDto.email,
            password: signupDto.password,
          })
          .expect(200)
          .expect(({ body }) => {
            expect(body.access_token).toBeDefined();
            authToken = body.access_token;
          });
      });

      it('should fail with wrong credentials', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: signupDto.email,
            password: 'wrongpassword',
          })
          .expect(401);
      });
    });
  });

  describe('Posts', () => {
    const signupDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    beforeEach(async () => {
      // Create a user and get auth token
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: signupDto.email,
          password: signupDto.password,
        });

      authToken = loginResponse.body.access_token;
    });

    describe('/posts (POST)', () => {
      const createPostDto = {
        title: 'Test Post',
        content: 'Test Content',
      };

      it('should create a post', () => {
        return request(app.getHttpServer())
          .post('/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(createPostDto)
          .expect(201)
          .expect(({ body }) => {
            expect(body.title).toBe(createPostDto.title);
            expect(body.content).toBe(createPostDto.content);
            expect(body.author).toBeDefined();
          });
      });

      it('should fail without auth token', () => {
        return request(app.getHttpServer())
          .post('/posts')
          .send(createPostDto)
          .expect(401);
      });
    });

    describe('/posts (GET)', () => {
      beforeEach(async () => {
        // Create some test posts
        const createPostDto = {
          title: 'Test Post',
          content: 'Test Content',
        };

        await request(app.getHttpServer())
          .post('/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(createPostDto);
      });

      it('should return paginated posts', () => {
        return request(app.getHttpServer())
          .get('/posts')
          .expect(200)
          .expect(({ body }) => {
            expect(Array.isArray(body.posts)).toBe(true);
            expect(body.total).toBeDefined();
            expect(body.page).toBeDefined();
            expect(body.totalPages).toBeDefined();
          });
      });

      it('should return posts with pagination', () => {
        return request(app.getHttpServer())
          .get('/posts?page=1')
          .expect(200)
          .expect(({ body }) => {
            expect(body.page).toBe(1);
          });
      });
    });

    describe('/posts/:id (GET)', () => {
      let postId: string;

      beforeEach(async () => {
        // Create a test post and store its ID
        const createPostDto = {
          title: 'Test Post',
          content: 'Test Content',
        };

        const response = await request(app.getHttpServer())
          .post('/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(createPostDto);

        postId = response.body.id;
      });

      it('should return a post by id', () => {
        return request(app.getHttpServer())
          .get(`/posts/${postId}`)
          .expect(200)
          .expect(({ body }) => {
            expect(body.id).toBe(postId);
            expect(body.title).toBe('Test Post');
            expect(body.content).toBe('Test Content');
            expect(body.author).toBeDefined();
          });
      });

      it('should return 404 for non-existent post', () => {
        return request(app.getHttpServer())
          .get('/posts/non-existent-id')
          .expect(404);
      });
    });
  });

  describe('Comments', () => {
    let postId: string;

    beforeEach(async () => {
      // Create a user and get auth token
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: signupDto.email,
          password: signupDto.password,
        });

      authToken = loginResponse.body.access_token;

      // Create a test post
      const createPostResponse = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Post',
          content: 'Test Content',
        });

      postId = createPostResponse.body.id;
    });

    describe('/posts/:postId/comments (POST)', () => {
      const createCommentDto = {
        content: 'Test comment',
      };

      it('should create a comment', () => {
        return request(app.getHttpServer())
          .post(`/posts/${postId}/comments`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(createCommentDto)
          .expect(201)
          .expect(({ body }) => {
            expect(body.content).toBe(createCommentDto.content);
            expect(body.author).toBeDefined();
          });
      });

      it('should fail without auth token', () => {
        return request(app.getHttpServer())
          .post(`/posts/${postId}/comments`)
          .send(createCommentDto)
          .expect(401);
      });

      it('should fail with non-existent post', () => {
        return request(app.getHttpServer())
          .post('/posts/non-existent/comments')
          .set('Authorization', `Bearer ${authToken}`)
          .send(createCommentDto)
          .expect(404);
      });
    });

    describe('/posts/:postId/comments (GET)', () => {
      beforeEach(async () => {
        // Create some test comments
        await request(app.getHttpServer())
          .post(`/posts/${postId}/comments`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ content: 'Comment 1' });

        await request(app.getHttpServer())
          .post(`/posts/${postId}/comments`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ content: 'Comment 2' });
      });

      it('should return paginated comments', () => {
        return request(app.getHttpServer())
          .get(`/posts/${postId}/comments`)
          .expect(200)
          .expect(({ body }) => {
            expect(Array.isArray(body.comments)).toBe(true);
            expect(body.nextCursor).toBeDefined();
            expect(body.comments.length).toBeGreaterThan(0);
            expect(body.comments[0].content).toBeDefined();
            expect(body.comments[0].author).toBeDefined();
          });
      });

      it('should handle cursor-based pagination', async () => {
        const firstResponse = await request(app.getHttpServer())
          .get(`/posts/${postId}/comments`)
          .expect(200);

        const cursor = firstResponse.body.nextCursor;
        if (cursor) {
          return request(app.getHttpServer())
            .get(`/posts/${postId}/comments?cursor=${cursor}`)
            .expect(200)
            .expect(({ body }) => {
              expect(Array.isArray(body.comments)).toBe(true);
            });
        }
      });
    });

    describe('/posts/:postId/comments/:commentId (DELETE)', () => {
      let commentId: string;

      beforeEach(async () => {
        // Create a test comment
        const response = await request(app.getHttpServer())
          .post(`/posts/${postId}/comments`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ content: 'Test comment' });

        commentId = response.body.id;
      });

      it('should delete a comment', () => {
        return request(app.getHttpServer())
          .delete(`/posts/${postId}/comments/${commentId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect(({ body }) => {
            expect(body.message).toBe('Comment deleted successfully');
          });
      });

      it('should fail without auth token', () => {
        return request(app.getHttpServer())
          .delete(`/posts/${postId}/comments/${commentId}`)
          .expect(401);
      });

      it('should fail with non-existent comment', () => {
        return request(app.getHttpServer())
          .delete(`/posts/${postId}/comments/non-existent`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });
    });
  });

  describe('Login Records', () => {
    beforeEach(async () => {
      // Create a user and get auth token
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: signupDto.email,
          password: signupDto.password,
        });

      authToken = loginResponse.body.access_token;
    });

    describe('/login-records/history (GET)', () => {
      it('should return login history for authenticated user', () => {
        return request(app.getHttpServer())
          .get('/login-records/history')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect(({ body }) => {
            expect(Array.isArray(body)).toBe(true);
            if (body.length > 0) {
              expect(body[0].loginTime).toBeDefined();
              expect(body[0].ipAddress).toBeDefined();
              expect(body[0].username).toBeDefined();
            }
          });
      });

      it('should fail without auth token', () => {
        return request(app.getHttpServer())
          .get('/login-records/history')
          .expect(401);
      });
    });

    describe('/login-records/rankings (GET)', () => {
      it('should return weekly rankings', () => {
        return request(app.getHttpServer())
          .get('/login-records/rankings')
          .expect(200)
          .expect(({ body }) => {
            expect(body.rankings).toBeDefined();
            expect(Array.isArray(body.rankings)).toBe(true);
            expect(body.period).toBeDefined();
            expect(body.period.start).toBeDefined();
            expect(body.period.end).toBeDefined();
          });
      });
    });
  });
});
