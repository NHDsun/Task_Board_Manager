import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VoiceLogStatus, TaskPriority, TaskStatus } from '@prisma/client';
import { SocketGateway } from '../socket/socket.gateway';
import { NotificationService } from '../notification/notification.service';
import { GroqWhisperService } from './groq-whisper.service';
import { VoiceRuleParser, type AiTaskResult, type ProjectSummary, type UserSummary } from './voice-rule.parser';
import OpenAI from 'openai';

export interface TaskAssigneeInfo {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
  profession: string;
}

export interface TaskCreatorInfo {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
}

export interface SubtaskAssigneeInfo {
  id: string;
  fullName: string;
  avatar: string | null;
}

export interface VoiceSubtaskItem {
  id: string;
  taskId: string;
  title: string;
  isDone: boolean;
  isUrgent: boolean;
  order: number;
  assignee?: SubtaskAssigneeInfo | null;
}

export interface VoiceCreatedTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  startDate: Date | null;
  dueDate: Date | null;
  projectId: string;
  assigneeId: string | null;
  createdById: string;
  rawVoice: string | null;
  stageId: string | null;
  createdAt: Date;
  updatedAt: Date;
  project?: {
    id: string;
    name: string;
  };
  assignee?: TaskAssigneeInfo | null;
  createdBy?: TaskCreatorInfo;
  tags?: Array<{
    tag: {
      id: string;
      name: string;
      color: string | null;
    };
  }>;
  subtasks?: VoiceSubtaskItem[];
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

export interface VoiceParseResponse {
  rawAudioText: string;
  parsedData: {
    title: string;
    description: string | null;
    priority: TaskPriority;
    projectId: string;
    projectName: string;
    assigneeId: string;
    assigneeName: string;
    assigneeEmail: string;
    dueDate: string | null;
  };
  projects: Array<{ id: string; name: string }>;
  users: Array<{ id: string; fullName: string; email: string; avatar: string | null; profession: string }>;
}

export interface ConfirmVoiceTaskPayload {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  projectId: string;
  assigneeId?: string | null;
  dueDate?: string | null;
  rawVoice?: string | null;
}

export interface VoiceTaskCreationResponse {
  success: boolean;
  message: string;
  task: VoiceCreatedTask;
  parsedData: AiTaskResult;
}

@Injectable()
export class AiVoiceService {
  private groq: OpenAI | null = null;
  private cachedModel: string | null = null;

  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway,
    private notificationService: NotificationService,
    private whisperService: GroqWhisperService
  ) {
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
    return this.whisperService.transcribeAudioFile(fileBuffer, filename, language);
  }

  async processVoiceAudioTaskCreation(
    userId: string,
    fileBuffer: Buffer,
    filename: string = 'voice-command.webm'
  ): Promise<VoiceTaskCreationResponse> {
    const rawAudioText = await this.transcribeAudioFile(fileBuffer, filename);
    return await this.processVoiceTaskCreation(userId, rawAudioText);
  }

  async parseVoiceText(userId: string, rawAudioText: string, currentProjectId?: string): Promise<VoiceParseResponse> {
    const projects = await this.prisma.project.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!projects || projects.length === 0) {
      throw new NotFoundException(
        'He thong chua co du an nao. Vui long tao it nhat 1 du an truoc khi su dung tro ly giong noi.'
      );
    }

    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, email: true, fullName: true, avatar: true, profession: true },
      orderBy: { fullName: 'asc' },
    });

    const now = new Date();
    const groqClient = this.getGroqClient();

    let aiResult: AiTaskResult = {
      title: rawAudioText.slice(0, 100),
      priority: 'NORMAL',
    };

    if (groqClient) {
      const todayStr = now.toISOString().split('T')[0];
      const currentDayOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][
        now.getDay()
      ];

      const prompt = `
Bạn là trợ lý ảo AI thông minh Solaris AI, CHUYÊN BIỆT XỬ LÝ KHẨU LỆNH SONG NGỮ (chỉ kết hợp Tiếng Việt và Tiếng Anh trong cùng 1 câu - Code-Switching) trong lĩnh vực kỹ thuật phần mềm & Agile Kanban.

QUY TẮC NHẬN DIỆN SONG NGỮ (TIẾNG VIỆT + TIẾNG ANH):
1. Hệ thống CHỈ chấp nhận Tiếng Việt và Tiếng Anh (không sử dụng ngôn ngữ nào khác).
2. Khi người dùng nói xen kẽ Tiếng Việt và Tiếng Anh (Vietglish), hãy hiểu chính xác ngữ nghĩa và giữ nguyên thuật ngữ kỹ thuật tiếng Anh (Fix bug, API, Authentication, UI/UX, Backend, Frontend, Review PR, Deploy, Database, Token, Kanban...).
3. Title (Tiêu đề): Trích xuất tiêu đề ngắn gọn, giữ nguyên thuật ngữ tiếng Anh gốc (ví dụ: 'Fix bug API Authentication', 'Thiết kế UI Kanban card', 'Review PR Backend payment', 'Deploy service lên Staging'). TUYỆT ĐỐI KHÔNG gộp người nhận ('cho Nam', 'for Alex'), độ ưu tiên ('khẩn cấp', 'urgent'), hoặc hạn chót ('deadline ngày mai') vào title.
4. Priority (Độ ưu tiên):
   - URGENT: nếu có 'khẩn cấp', 'gấp', 'urgent', 'asap', 'ngay lập tức'
   - IMPORTANT: nếu có 'quan trọng', 'ưu tiên', 'important', 'high'
   - LOW: nếu có 'thấp', 'rảnh làm', 'low'
   - Mặc định: 'NORMAL'
5. DueDate: Tính toán ngày chính xác từ ngày hôm nay ${todayStr} (${currentDayOfWeek}):
   - 'hôm nay' / 'today' -> ${todayStr}
   - 'ngày mai' / 'tomorrow' -> ngày tiếp theo
   - 'ngày kia' / 'the day after tomorrow' -> cộng 2 ngày
   - 'tuần sau' / 'next week' -> cộng 7 ngày

Thời điểm hiện tại: ${todayStr} (${currentDayOfWeek}).
Danh sách Dự án: ${JSON.stringify(projects.map((p) => ({ id: p.id, name: p.name })))}
Danh sách Thành viên: ${JSON.stringify(users.map((u) => ({ id: u.id, email: u.email, fullName: u.fullName })))}

Câu lệnh giọng nói của người dùng:
"${rawAudioText}"

Hãy trả về duy nhất 1 JSON object thuần túy theo cấu trúc:
{
  "title": "Nội dung công việc chuẩn xác",
  "description": null hoặc "Mô tả nếu có",
  "priority": "LOW" | "NORMAL" | "IMPORTANT" | "URGENT",
  "projectName": "Tên dự án phù hợp nhất hoặc null",
  "assigneeEmail": "Email của thành viên được giao hoặc null",
  "assigneeName": "Tên thành viên nếu có hoặc null",
  "dueDate": "YYYY-MM-DD hoặc null"
}
`.trim();

      const candidateModels = [
        await this.resolveGroqModel(groqClient),
        'openai/gpt-oss-120b',
        'llama-3.3-70b-versatile',
        'openai/gpt-oss-20b',
        'qwen/qwen3.8-27b',
        'allam-2-7b',
      ];
      const uniqueCandidates = Array.from(new Set(candidateModels));

      for (const modelToTry of uniqueCandidates) {
        try {
          const completion = await groqClient.chat.completions.create({
            model: modelToTry,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
          });
          if (completion?.choices?.[0]?.message?.content) {
            const cleanJsonText = completion.choices[0].message.content
              .replace(/```json/g, '')
              .replace(/```/g, '')
              .trim();
            const parsed: unknown = JSON.parse(cleanJsonText);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              const obj = parsed as Record<string, unknown>;
              aiResult = {
                title: typeof obj.title === 'string' ? obj.title : rawAudioText.slice(0, 100),
                description: typeof obj.description === 'string' ? obj.description : null,
                priority: typeof obj.priority === 'string' ? obj.priority : 'NORMAL',
                projectName: typeof obj.projectName === 'string' ? obj.projectName : null,
                assigneeEmail: typeof obj.assigneeEmail === 'string' ? obj.assigneeEmail : null,
                assigneeName: typeof obj.assigneeName === 'string' ? obj.assigneeName : null,
                dueDate: typeof obj.dueDate === 'string' ? obj.dueDate : null,
              };
              this.cachedModel = modelToTry;
              break;
            }
          }
        } catch {
        }
      }
    }

    if (!aiResult.title || aiResult.title === rawAudioText.slice(0, 100)) {
      aiResult = VoiceRuleParser.parse(rawAudioText, projects, users, now);
    }

    let targetProjectId = currentProjectId;
    if (aiResult.projectName) {
      const targetName = aiResult.projectName.toLowerCase();
      const foundProj = projects.find(
        (p) => p.name.toLowerCase().includes(targetName) || targetName.includes(p.name.toLowerCase())
      );
      if (foundProj) {
        targetProjectId = foundProj.id;
      }
    }
    if (!targetProjectId || !projects.some((p) => p.id === targetProjectId)) {
      targetProjectId = projects[0].id;
    }
    const matchedProjectName = projects.find((p) => p.id === targetProjectId)?.name || 'Dự án mặc định';

    let targetAssigneeId: string | null = null;
    if (aiResult.assigneeEmail) {
      const targetEmail = aiResult.assigneeEmail.toLowerCase();
      const foundUser = users.find((u) => u.email.toLowerCase() === targetEmail);
      if (foundUser) {
        targetAssigneeId = foundUser.id;
      }
    }

    if (!targetAssigneeId && (aiResult.assigneeName || aiResult.assigneeEmail)) {
      const queryName = VoiceRuleParser.normalizeVietnamese(aiResult.assigneeName || aiResult.assigneeEmail || '').trim();

      const foundUser = users.find((u) => {
        const uClean = VoiceRuleParser.normalizeVietnamese(u.fullName.replace(/\s*\([^)]*\)/g, '')).trim();
        const uParts = uClean.split(/\s+/);
        const uFirst = uParts[uParts.length - 1];

        return (
          uClean === queryName ||
          uFirst === queryName ||
          uClean.includes(queryName) ||
          queryName.includes(uFirst) ||
          u.email.toLowerCase().includes(queryName)
        );
      });

      if (foundUser) {
        targetAssigneeId = foundUser.id;
      }
    }

    if (!targetAssigneeId) {
      targetAssigneeId = userId;
    }

    const assignedUser = users.find((u) => u.id === targetAssigneeId);

    const rawPriority = (aiResult.priority || 'NORMAL').toUpperCase();
    let priority: TaskPriority = TaskPriority.NORMAL;
    if (rawPriority === 'LOW') priority = TaskPriority.LOW;
    else if (rawPriority === 'IMPORTANT') priority = TaskPriority.IMPORTANT;
    else if (rawPriority === 'URGENT') priority = TaskPriority.URGENT;

    return {
      rawAudioText,
      parsedData: {
        title: aiResult.title || rawAudioText,
        description: aiResult.description || null,
        priority,
        projectId: targetProjectId,
        projectName: matchedProjectName,
        assigneeId: targetAssigneeId,
        assigneeName: assignedUser?.fullName || 'Chính bạn',
        assigneeEmail: assignedUser?.email || '',
        dueDate: aiResult.dueDate || null,
      },
      projects: projects.map((p) => ({ id: p.id, name: p.name })),
      users: users.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        avatar: u.avatar,
        profession: u.profession,
      })),
    };
  }

  async parseVoiceAudio(
    userId: string,
    fileBuffer: Buffer,
    filename: string = 'voice-command.webm',
    currentProjectId?: string
  ): Promise<VoiceParseResponse> {
    const rawAudioText = await this.transcribeAudioFile(fileBuffer, filename);
    return await this.parseVoiceText(userId, rawAudioText, currentProjectId);
  }

  async confirmCreateTask(userId: string, payload: ConfirmVoiceTaskPayload): Promise<VoiceTaskCreationResponse> {
    const startTime = Date.now();

    const voiceLog = await this.prisma.voiceCommandLog.create({
      data: {
        userId,
        rawAudioText: payload.rawVoice || payload.title,
        status: VoiceLogStatus.PARSED,
      },
    });

    let parsedDueDate: Date | null = null;
    if (payload.dueDate) {
      const d = new Date(payload.dueDate);
      if (!isNaN(d.getTime())) {
        parsedDueDate = d;
      }
    }

    const priority = payload.priority || TaskPriority.NORMAL;
    const targetAssigneeId = payload.assigneeId || userId;

    const newTask = await this.prisma.task.create({
      data: {
        title: payload.title,
        description: payload.description || null,
        priority,
        dueDate: parsedDueDate,
        projectId: payload.projectId,
        assigneeId: targetAssigneeId,
        createdById: userId,
        rawVoice: payload.rawVoice || null,
        stageId: 'stage_1',
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
            profession: true,
          },
        },
        createdBy: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        tags: { include: { tag: true } },
        subtasks: {
          include: {
            assignee: { select: { id: true, fullName: true, avatar: true } },
          },
        },
        attachments: true,
      },
    });

    const processingTimeMs = Date.now() - startTime;

    await this.prisma.voiceCommandLog.update({
      where: { id: voiceLog.id },
      data: {
        intent: 'CREATE_TASK',
        parsedJson: JSON.stringify(payload),
        status: VoiceLogStatus.SUCCESS,
        processingTimeMs,
        projectId: payload.projectId,
        taskId: newTask.id,
      },
    });

    if (newTask.projectId) {
      this.socketGateway.broadcastToProject(newTask.projectId, 'task:created', newTask);
    }

    if (newTask.assigneeId && newTask.assigneeId !== userId) {
      await this.notificationService.sendNotification({
        userId: newTask.assigneeId,
        actorId: userId,
        title: 'Bạn được giao Task mới qua Giọng nói',
        content: `Bạn vừa được giao phụ trách Task "${newTask.title}" bằng lệnh giọng nói AI Solaris.`,
        type: 'TASK_ASSIGNED',
        taskId: newTask.id,
        projectId: newTask.projectId,
      });
    }

    return {
      success: true,
      message: 'Tạo công việc thành công bằng AI Voice!',
      task: newTask,
      parsedData: {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        projectName: newTask.project?.name,
        assigneeEmail: newTask.assignee?.email,
        assigneeName: newTask.assignee?.fullName,
        dueDate: payload.dueDate,
      },
    };
  }

  private async resolveGroqModel(groqClient: OpenAI): Promise<string> {
    if (this.cachedModel) return this.cachedModel;
    if (process.env.GROQ_MODEL) {
      this.cachedModel = process.env.GROQ_MODEL;
      return this.cachedModel;
    }

    try {
      const modelList = await groqClient.models.list();
      const availableIds = modelList.data.map((m) => m.id);

      const preferredOrder = [
        'openai/gpt-oss-120b',
        'llama-3.3-70b-versatile',
        'openai/gpt-oss-20b',
        'qwen/qwen3.8-27b',
        'allam-2-7b',
        'llama-3.1-8b-instant',
        'llama-3.1-70b-versatile',
        'llama3-70b-8192',
        'llama3-8b-8192',
        'mixtral-8x7b-32768',
        'gemma2-9b-it',
        'qwen-2.5-32b',
        'deepseek-r1-distill-llama-70b',
      ];

      for (const modelId of preferredOrder) {
        if (availableIds.includes(modelId)) {
          this.cachedModel = modelId;
          return modelId;
        }
      }

      const anyChatModel = availableIds.find(
        (id) =>
          id.includes('gpt-oss') ||
          id.includes('llama') ||
          id.includes('qwen') ||
          id.includes('allam') ||
          id.includes('mixtral') ||
          id.includes('gemma')
      );

      if (anyChatModel) {
        this.cachedModel = anyChatModel;
        return anyChatModel;
      }

      if (availableIds.length > 0 && availableIds[0]) {
        this.cachedModel = availableIds[0];
        return availableIds[0];
      }
    } catch {
    }

    this.cachedModel = 'openai/gpt-oss-120b';
    return this.cachedModel;
  }

  async processVoiceTaskCreation(userId: string, rawAudioText: string): Promise<VoiceTaskCreationResponse> {
    const startTime = Date.now();

    const voiceLog = await this.prisma.voiceCommandLog.create({
      data: {
        userId,
        rawAudioText,
        status: VoiceLogStatus.PARSED,
      },
    });

    try {
      const parseRes = await this.parseVoiceText(userId, rawAudioText);
      const confirmPayload: ConfirmVoiceTaskPayload = {
        title: parseRes.parsedData.title,
        description: parseRes.parsedData.description,
        priority: parseRes.parsedData.priority,
        projectId: parseRes.parsedData.projectId,
        assigneeId: parseRes.parsedData.assigneeId,
        dueDate: parseRes.parsedData.dueDate,
        rawVoice: rawAudioText,
      };

      const result = await this.confirmCreateTask(userId, confirmPayload);

      await this.prisma.voiceCommandLog.update({
        where: { id: voiceLog.id },
        data: {
          intent: 'CREATE_TASK',
          parsedJson: JSON.stringify(parseRes.parsedData),
          status: VoiceLogStatus.SUCCESS,
          processingTimeMs: Date.now() - startTime,
          projectId: parseRes.parsedData.projectId,
          taskId: result.task.id,
        },
      });

      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.prisma.voiceCommandLog.update({
        where: { id: voiceLog.id },
        data: {
          status: VoiceLogStatus.FAILED,
          errorMessage,
          processingTimeMs: Date.now() - startTime,
        },
      });
      throw new InternalServerErrorException(`Lỗi khi xử lý giọng nói: ${errorMessage}`);
    }
  }
}
