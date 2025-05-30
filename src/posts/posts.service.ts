import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(userId: string, createPostDto: CreatePostDto) {
    return this.prisma.post.create({
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
  }

  async getPosts(page = 1) {
    const take = 20;
    const skip = (page - 1) * take;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        take,
        skip,
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
      }),
      this.prisma.post.count(),
    ]);

    return {
      posts,
      total,
      page,
      totalPages: Math.ceil(total / take),
    };
  }

  async getPost(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    return post;
  }
}
