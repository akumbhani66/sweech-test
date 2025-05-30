import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createComment(
    @Param('postId') postId: string,
    @Request() req,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(
      postId,
      req.user.id,
      createCommentDto,
    );
  }

  @Get()
  async getComments(
    @Param('postId') postId: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.commentsService.getComments(postId, cursor);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  async deleteComment(@Param('commentId') commentId: string, @Request() req) {
    return this.commentsService.deleteComment(commentId, req.user.id);
  }
}
