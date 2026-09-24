import { Controller, Post, Body, Req, UseGuards, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AiVoiceService, VoiceTaskCreationResponse } from './ai-voice.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

export interface CreateVoiceTaskDto {
  rawAudioText: string;
  userId?: string;
}

export interface AuthenticatedUserPayload {
  id: string;
  email?: string;
  role?: string;
}

export interface RequestWithUser extends Request {
  user?: AuthenticatedUserPayload;
}

@Controller('tasks/voice')
@UseGuards(JwtAuthGuard)
export class AiVoiceController {
  constructor(private readonly aiVoiceService: AiVoiceService) {}

  @Post('create')
  async createFromVoice(
    @Req() req: RequestWithUser,
    @Body() body: CreateVoiceTaskDto
  ): Promise<VoiceTaskCreationResponse> {
    const rawAudioText = body?.rawAudioText?.trim();
    if (!rawAudioText) {
      throw new BadRequestException('Vui lòng cung cấp khẩu lệnh giọng nói (rawAudioText).');
    }

    const userId = req.user?.id || body.userId;
    if (!userId) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
    }

    return await this.aiVoiceService.processVoiceTaskCreation(userId, rawAudioText);
  }
}
