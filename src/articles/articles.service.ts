import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import slugify from 'slugify';
import { Article, Tag, User } from '@prisma/client';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(title: string) {
    return slugify(title, { lower: true }) + '-' + Date.now();
  }

  async create(userId: number, dto: CreateArticleDto) {
    const slug = this.generateSlug(dto.title);

    const tags =
      dto.tagList?.map((tag) => ({
        where: { name: tag },
        create: { name: tag },
      })) || [];

    const article = await this.prisma.article.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        body: dto.body,
        authorId: userId,
        tagList: {
          connectOrCreate: tags,
        },
      },
      include: {
        author: true,
        tagList: true,
      },
    });

    return article;
  }

  async findBySlug(
    slug: string,
  ): Promise<Article & { tagList: Tag[]; author: User }> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: true,
        tagList: true,
      },
    });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async update(slug: string, userId: number, dto: UpdateArticleDto) {
    const existing = await this.prisma.article.findUnique({
      where: { slug },
      include: { tagList: true },
    });

    if (!existing) {
      throw new NotFoundException('Article not found');
    }
    if (existing.authorId !== userId) {
      throw new ForbiddenException('Unauthorized');
    }

    let newSlug = slug;
    if (dto.title) {
      newSlug = this.generateSlug(dto.title);
    }

    let tagListUpdate = {};
    if (dto.tagList) {
      const newTags = dto.tagList.map((tag) => ({
        where: { name: tag },
        create: { name: tag },
      }));
      tagListUpdate = {
        tagList: {
          set: [],
          connectOrCreate: newTags,
        },
      };
    }

    const updated = await this.prisma.article.update({
      where: { slug },
      data: {
        title: dto.title,
        description: dto.description,
        body: dto.body,
        slug: newSlug,
        ...tagListUpdate,
      },
      include: {
        author: true,
        tagList: true,
      },
    });

    return updated;
  }

  async remove(slug: string, userId: number) {
    const article = await this.prisma.article.findUnique({ where: { slug } });
    if (!article) {
      throw new NotFoundException('Article not found');
    } 
    if (article.authorId !== userId) {
      throw new ForbiddenException('Unauthorized');
    }

    await this.prisma.article.delete({ where: { slug } });
    return;
  }
}
