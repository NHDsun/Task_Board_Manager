import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import OpenAI, { toFile } from 'openai';

@Injectable()
export class GroqWhisperService {
  private groq: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.groq = new OpenAI({
        apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });
    }
  }

  private getGroqClient(): OpenAI | null {
    if (!this.groq) {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) return null;
      this.groq = new OpenAI({
        apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });
    }
    return this.groq;
  }

  async transcribeAudioFile(
    fileBuffer: Buffer,
    filename: string = 'voice-command.webm',
    language?: string
  ): Promise<string> {
    const groqClient = this.getGroqClient();
    if (!groqClient) {
      throw new BadRequestException(
        'Chưa cấu hình GROQ_API_KEY trong hệ thống Backend. Vui lòng cấu hình biến môi trường GROQ_API_KEY.'
      );
    }

    const candidateModels = ['whisper-large-v3', 'whisper-large-v3-turbo'];
    let lastError: string | null = null;

    const bilingualPrompt =
      'Solaris Task Assistant. Nhận diện chuẩn xác khẩu lệnh song ngữ Tiếng Việt và Tiếng Anh trong cùng một câu: ' +
      'Tạo task Fix bug API Authentication cho Nam deadline ngày mai. ' +
      'Giao việc review PR backend và deploy lên server cho Tuấn mức độ urgent. ' +
      'Cập nhật UI/UX Kanban card, refactor code, database migration, setup Redis, release sprint.';

    const effectiveLanguage = language && (language === 'vi' || language === 'en') ? language : 'vi';

    for (const modelName of candidateModels) {
      try {
        const audioFile = await toFile(fileBuffer, filename);
        const requestParams: OpenAI.Audio.Transcriptions.TranscriptionCreateParams = {
          file: audioFile,
          model: modelName,
          prompt: bilingualPrompt,
          language: effectiveLanguage,
          temperature: 0.0,
        };

        const transcription = await groqClient.audio.transcriptions.create(requestParams);
        const text = transcription?.text?.trim() || '';
        if (text) {
          return this.normalizeBilingualText(text);
        }
      } catch (modelErr: unknown) {
        lastError = modelErr instanceof Error ? modelErr.message : String(modelErr);
        console.warn(`Groq Whisper model ${modelName} encountered error: ${lastError}. Đang thử model tiếp theo...`);
      }
    }

    if (lastError) {
      console.error('Tất cả model Groq Whisper đều gặp lỗi:', lastError);
      throw new InternalServerErrorException(`Lỗi nhận diện âm thanh qua Groq Whisper: ${lastError}`);
    }

    throw new BadRequestException('Không nhận diện được giọng nói trong đoạn âm thanh tải lên.');
  }

  normalizeBilingualText(text: string): string {
    if (!text) return '';
    let result = text;
    const replacements: Array<[RegExp, string]> = [
      [/\b(?:phích\s+bấc|fix\s+bấc|phích\s+bug|fic\s+bug|fit\s+bug)\b/gi, 'fix bug'],
      [/\b(?:đét\s*lai|đết\s*lai|dét\s*lai)\b/gi, 'deadline'],
      [/\b(?:bác\s*en|bát\s*en|ba\s*ken)\b/gi, 'backend'],
      [/\b(?:phờ\s*ron\s*en|phờ\s*rôn\s*en|phơ\s*ron\s*en)\b/gi, 'frontend'],
      [/\b(?:o\s*thên|o\s*then|ót\s*thên|ao\s*th)\b/gi, 'authentication'],
      [/\b(?:ri\s*viu|ri\s*view)\b/gi, 'review'],
      [/\b(?:đi\s*poi|đép\s*loi|đíp\s*loi|đíp\s*loy)\b/gi, 'deploy'],
      [/\b(?:súp\s*tát|súp\s*tác|súp\s*task)\b/gi, 'subtask'],
      [/\b(?:mơn\s*code|mớp\s*code|mơt\s*code)\b/gi, 'merge code'],
      [/\b(?:u\s*gân|ưa\s*gần)\b/gi, 'urgent'],
      [/\b(?:đa\s*ta\s*bây|đa\s*ta\s*bét)\b/gi, 'database'],
    ];

    for (const [pattern, replacement] of replacements) {
      result = result.replace(pattern, replacement);
    }
    return result;
  }
}
