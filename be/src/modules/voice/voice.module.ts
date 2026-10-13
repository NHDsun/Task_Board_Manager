import { Module } from '@nestjs/common';
import { AiVoiceController } from './voice.controller';
import { AiVoiceService } from './ai-voice.service';
import { GroqWhisperService } from './groq-whisper.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [AiVoiceController],
  providers: [AiVoiceService, GroqWhisperService, PrismaService],
  exports: [AiVoiceService, GroqWhisperService],
})
export class AiVoiceModule {}
