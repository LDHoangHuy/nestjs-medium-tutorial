import { Controller, Get, Put, Body, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestUser } from 'src/auth/interfaces/request-user.interface';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getCurrentUser(@Req() req: RequestUser) {
    const user = await this.userService.getUserById(req.user.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateUser(@Req() req: RequestUser, @Body('user') updateUserDto: UpdateUserDto) {
    const userId = req.user.sub;
    const userUpdated = await this.userService.updateUser(userId, updateUserDto);
    return { user: userUpdated };
  }
}
