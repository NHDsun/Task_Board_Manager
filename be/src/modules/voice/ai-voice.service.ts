import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VoiceLogStatus, TaskPriority } from '@prisma/client';
import OpenAI from 'openai';
export interface AiTaskResult {
  title?: string;
  description?: string;
  priority?: string;
  projectName?: string;
  assigneeEmail?: string;
  dueDate?: string;
}
@Injectable()
export class AiVoiceService {
  private groq: OpenAI;

  constructor(private prisma: PrismaService) {
    this.groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY || 'dummy_groq_key',
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async processVoiceTaskCreation(userId: string, rawAudioText: string) {
    const startTime = Date.now();

    const voiceLog = await this.prisma.voiceCommandLog.create({
      data: {
        userId,
        rawAudioText,
        status: VoiceLogStatus.PARSED,
      },
    });

    try {
      const projects = await this.prisma.project.findMany({
        where: { isDeleted: false },
        select: { id: true, name: true },
      });

      const users = await this.prisma.user.findMany({
        where: { isActive: true },
        select: { id: true, email: true, fullName: true },
      });

      const prompt = `
Bạn là một trợ lý ảo quản lý dự án thông minh. Hãy phân tích câu lệnh tiếng Việt sau đây và trích xuất thành đối tượng JSON.

Danh sách dự án hiện có: ${JSON.stringify(projects)}
Danh sách thành viên hiện có: ${JSON.stringify(users)}

Câu lệnh của người dùng: "${rawAudioText}"

Hãy trả về kết quả dưới dạng JSON thuần túy (không kèm markdown) với cấu trúc sau:
{
  "title": "Tiêu đề công việc ngắn gọn, rõ nghĩa",
  "description": "Mô tả chi tiết nếu có, hoặc null",
  "priority": "LOW" | "NORMAL" | "IMPORTANT" | "URGENT",
  "projectName": "Tên dự án khớp chính xác nhất với danh sách dự án ở trên, hoặc null",
  "assigneeEmail": "Email của thành viên được giao việc khớp với danh sách ở trên, hoặc null",
  "dueDate": "YYYY-MM-DD nếu có mốc thời gian hạn chót cụ thể, hoặc null"
}
      `;

      const completion = await this.groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',

        messages: [{ role: 'user', content: prompt }],

        response_format: { type: 'json_object' },
      });

      const aiResultText = completion.choices[0].message.content;

      let cleanJsonText = aiResultText || '{}';
      cleanJsonText = cleanJsonText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const aiResult = JSON.parse(cleanJsonText) as AiTaskResult;

      let targetProjectId = projects[0]?.id;
      if (aiResult.projectName) {
        const foundProj = projects.find((p) => p.name.toLowerCase().includes(aiResult.projectName.toLowerCase()));
        if (foundProj) targetProjectId = foundProj.id;
      }
      if (!targetProjectId) {
        throw new NotFoundException('Không tìm thấy dự án hợp lệ để tạo task.');
      }

      let targetAssigneeId: string | null = null;
      if (aiResult.assigneeEmail) {
        const foundUser = users.find((u) => u.email === aiResult.assigneeEmail);
        if (foundUser) targetAssigneeId = foundUser.id;
      }

      if (!targetProjectId) {
        throw new NotFoundException('Không tìm thấy dự án hợp lệ để tạo task.');
      }

      const newTask = await this.prisma.task.create({
        data: {
          title: aiResult.title || 'Công việc từ lệnh giọng nói',
          description: aiResult.description,
          priority: (aiResult.priority as TaskPriority) || TaskPriority.NORMAL,
          dueDate: aiResult.dueDate ? new Date(aiResult.dueDate) : null,
          projectId: targetProjectId,
          assigneeId: targetAssigneeId,
          createdById: userId,
          rawVoice: rawAudioText,
        },
      });

      const processingTimeMs = Date.now() - startTime;

      await this.prisma.voiceCommandLog.update({
        where: { id: voiceLog.id },
        data: {
          intent: 'CREATE_TASK',
          parsedJson: JSON.stringify(aiResult),
          status: VoiceLogStatus.SUCCESS,
          processingTimeMs,
          projectId: targetProjectId,
          taskId: newTask.id,
        },
      });

      return {
        success: true,
        message: 'Tạo công việc thành công bằng AI Voice!',
        task: newTask,
        parsedData: aiResult,
      };
    } catch (error: unknown) {
      const err = error as Error;

      await this.prisma.voiceCommandLog.update({
        where: { id: voiceLog.id },
        data: {
          status: VoiceLogStatus.FAILED,
          errorMessage: err.message || 'Unknown error',
          processingTimeMs: Date.now() - startTime,
        },
      });

      throw error;
    }
  }
}
