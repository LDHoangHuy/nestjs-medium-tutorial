import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RequestUser } from 'src/auth/interfaces/request-user.interface';
import { CommentEntity } from './entities/comment.entity';

@Controller('api/articles/:slug/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Param('slug') slug: string,
    @Body('comment') createCommentDto: CreateCommentDto,
    @Req() req: RequestUser,
  ): Promise<{ comment: CommentEntity}> {
    const comment = await this.commentsService.create(
      slug,
      req.user.sub,
      createCommentDto,
    );
    return { comment: new CommentEntity(comment) };
  }

  @Get()
  async findAll(
    @Param('slug') slug: string,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ): Promise<{ comments: CommentEntity[] }> {
    const comments = await this.commentsService.findByArticleSlug(
      slug,
      +limit,
      +offset,
    );
    return {
      comments: comments.map((c) => new CommentEntity(c)),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Req() req: RequestUser,
  ) {
    await this.commentsService.remove(slug, +id, req.user.sub);
    return;
  }
}
