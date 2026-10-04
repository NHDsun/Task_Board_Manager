import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateStatusSignalDto } from './dto/update-status-signal.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthenticatedRequest } from '../../common/interfaces/auth-user.interface';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.profileService.getProfile(req.user.id);
  }

  @Get('users')
  async getAllUsers() {
    return this.profileService.getAllUsers();
  }

  @Patch('me')
  async updateProfile(@Request() req: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.id, dto);
  }

  @Patch('status')
  async updateStatusSignal(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateStatusSignalDto,
  ) {
    return this.profileService.updateStatusSignal(req.user.id, dto);
  }

  @Patch('change-password')
  async changePassword(@Request() req: AuthenticatedRequest, @Body() dto: ChangePasswordDto) {
    return this.profileService.changePassword(req.user.id, dto);
  }

  @Get('stats')
  async getStats(@Request() req: AuthenticatedRequest) {
    return this.profileService.getPersonalStats(req.user.id);
  }
}
