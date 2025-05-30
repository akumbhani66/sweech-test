import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(req.user.id, createPostDto);
  }

  @Get()
  async getPosts(@Query('page') page?: number) {
    return this.postsService.getPosts(page || 1);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.postsService.getPost(id);
  }
}
