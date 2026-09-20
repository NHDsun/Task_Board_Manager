import { Controller, Post, Body } from '@nestjs/common';
import { AiVoiceService, AiTaskResult } from './ai-voice.service';
interface CreateVoiceTaskBody {
  rawAudioText: string;
  userId?: string;
}

@Controller('tasks/voice')
export class AiVoiceController {
  constructor(private readonly aiVoiceService: AiVoiceService) {}

  @Post('create')
  async createFromVoice(@Body() body: CreateVoiceTaskBody): Promise<{
    success: boolean;
    message: string;
    task: any;
    parsedData: AiTaskResult;
  }> {
    const userId = body.userId || 'DEFAULT_USER_ID';

    return await this.aiVoiceService.processVoiceTaskCreation(userId, body.rawAudioText);
  }
}
