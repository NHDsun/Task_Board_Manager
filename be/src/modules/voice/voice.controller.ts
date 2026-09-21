import { Controller, Post, Body, Req } from '@nestjs/common';
import { AiVoiceService, AiTaskResult } from './ai-voice.service';
import { Request } from 'express'; // Import Request từ express

interface CreateVoiceTaskBody {
  rawAudioText: string;
  userId?: string;
}

interface RequestWithUser extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

@Controller('tasks/voice')
export class AiVoiceController {
  constructor(private readonly aiVoiceService: AiVoiceService) {}

  @Post('create')
  async createFromVoice(
    @Req() req: RequestWithUser,
    @Body() body: CreateVoiceTaskBody
  ): Promise<{
    success: boolean;
    message: string;
    task: any;
    parsedData: AiTaskResult;
  }> {
    const userId = req.user?.id || body.userId || 'DEFAULT_USER_ID';

    return await this.aiVoiceService.processVoiceTaskCreation(userId, body.rawAudioText);
  }
}
