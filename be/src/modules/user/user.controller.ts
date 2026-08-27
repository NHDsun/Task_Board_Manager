import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { LockUserDto } from './dto/lock-user.dto';
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email?: string;
    role?: string;
  };
}
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }
  @UseGuards(JwtAuthGuard)
  @Get()
  @Roles('ADMIN', 'MANAGER')
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN', 'MANAGER')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id/role')
  @Roles('ADMIN')
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.userService.updateRoleAndDepartment(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/lock')
  @Roles('ADMIN')
  lockUser(
    @Param('id') id: string,
    @Body() dto: LockUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const user = req.user as { id?: string; userId?: string } | undefined;
    const adminId: string = String(user.id || user.userId);
    return this.userService.lockOrUnlockUser(id, dto, adminId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
