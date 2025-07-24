import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RequestUser } from 'src/auth/interfaces/request-user.interface';
import { ArticleEntity } from './entities/article.entity';

@Controller('api/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const article = await this.articlesService.findBySlug(slug);
    return new ArticleEntity(article);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body('article') dto: CreateArticleDto,
    @Req() req: RequestUser,
  ): Promise<ArticleEntity> {
    const article = await this.articlesService.create(req.user.sub, dto);
    return new ArticleEntity(article);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':slug')
  async update(
    @Param('slug') slug: string,
    @Body('article') dto: UpdateArticleDto,
    @Req() req: RequestUser,
  ) {
    const article = await this.articlesService.update(slug, req.user.sub, dto);
    return new ArticleEntity(article);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('slug') slug: string, @Req() req: RequestUser) {
    return this.articlesService.remove(slug, req.user.sub);
  }
}
