import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getCurrentUser(@Req() req: Request) {
    const user = await this.userService.getUserById((req.user as any)['sub']);
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Put('user')
  async updateUser(@Req() req: Request, @Body('user') dto: UpdateUserDto) {
    const userId = (req.user as any)['sub'];
    const userUpdated = await this.userService.updateUser(userId, dto);
    return { user: userUpdated };
  }
}
