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
import { RolesGuard } from '../../common/guards/roles.guard';
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
  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN', 'MANAGER')
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }
  @Get(':id/workload')
  // @UseGuards(JwtAuthGuard)
  getUserWorkload(@Param('id') id: string) {
    return this.userService.getUserWorkload(id);
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/lock')
  @Roles('ADMIN')
  lockUser(
    @Param('id') id: string,
    @Body() dto: LockUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const adminId = req.user.id;
    return this.userService.lockOrUnlockUser(id, dto, adminId);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/reset-password')
  @Roles('ADMIN')
  resetPassword(@Param('id') id: string) {
    return this.userService.resetPassword(id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const adminId = req.user.id;
    return this.userService.remove(id, adminId);
  }
}
