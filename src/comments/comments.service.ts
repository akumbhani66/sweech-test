import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async createComment(
    postId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ) {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.comment.create({
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
  }

  async getComments(postId: string, cursor?: string) {
    const take = 10;

    // Build the query
    const query: any = {
      take,
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
    };

    // Add cursor if provided
    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1; // Skip the cursor
    }

    // Get comments
    const comments = await this.prisma.comment.findMany(query);

    // Get the next cursor
    const nextCursor =
      comments.length === take ? comments[comments.length - 1].id : null;

    return {
      comments,
      nextCursor,
    };
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user is authorized to delete the comment
    if (comment.authorId !== userId && comment.post.authorId !== userId) {
      throw new ForbiddenException('Not authorized to delete this comment');
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    return { message: 'Comment deleted successfully' };
  }
}
