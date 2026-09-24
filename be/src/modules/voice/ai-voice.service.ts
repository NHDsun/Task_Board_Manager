import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VoiceLogStatus, TaskPriority, TaskStatus } from '@prisma/client';
import { SocketGateway } from '../socket/socket.gateway';
import { NotificationService } from '../notification/notification.service';
import OpenAI from 'openai';

export interface AiTaskResult {
  title?: string;
  description?: string | null;
  priority?: string;
  projectName?: string | null;
  assigneeEmail?: string | null;
  assigneeName?: string | null;
  dueDate?: string | null;
}

export interface ProjectSummary {
  id: string;
  name: string;
}

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
}

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
    private notificationService: NotificationService
  ) {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.groq = new OpenAI({
        apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });
    }
  }

  private getGroqClient(): OpenAI {
    if (!this.groq) {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new BadRequestException(
          'Chưa cấu hình GROQ_API_KEY trong hệ thống Backend. Vui lòng kiểm tra biến môi trường.'
        );
      }
      this.groq = new OpenAI({
        apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });
    }
    return this.groq;
  }

  private async resolveGroqModel(groqClient: OpenAI): Promise<string> {
    if (this.cachedModel) {
      return this.cachedModel;
    }

    if (process.env.GROQ_MODEL) {
      this.cachedModel = process.env.GROQ_MODEL;
      return this.cachedModel;
    }

    try {
      const modelList = await groqClient.models.list();
      const availableIds = modelList.data.map((m) => m.id);

      // Danh sách model ưu tiên theo thứ tự
      const preferredOrder = [
        'llama-3.3-70b-versatile',
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
        (id) => id.includes('llama') || id.includes('mixtral') || id.includes('gemma') || id.includes('qwen')
      );

      if (anyChatModel) {
        this.cachedModel = anyChatModel;
        return anyChatModel;
      }

      if (availableIds.length > 0 && availableIds[0]) {
        this.cachedModel = availableIds[0];
        return availableIds[0];
      }
    } catch (listErr: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const msg = listErr instanceof Error ? listErr.message : String(listErr);
      console.warn('Không thể tự động truy vấn danh sách model Groq:', msg);
    }

    this.cachedModel = 'llama-3.3-70b-versatile';
    return this.cachedModel;
  }

  private fallbackRuleBasedParser(
    rawText: string,
    projects: ProjectSummary[],
    users: UserSummary[],
    today: Date
  ): AiTaskResult {
    const textLower = rawText.toLowerCase();

    // 1. Phân tích Mức độ ưu tiên
    let priority = 'NORMAL';
    if (
      textLower.includes('khẩn cấp') ||
      textLower.includes('gấp') ||
      textLower.includes('ngay lập tức') ||
      textLower.includes('urgent')
    ) {
      priority = 'URGENT';
    } else if (textLower.includes('quan trọng') || textLower.includes('ưu tiên') || textLower.includes('important')) {
      priority = 'IMPORTANT';
    } else if (textLower.includes('thấp') || textLower.includes('rảnh làm') || textLower.includes('low')) {
      priority = 'LOW';
    }

    // 2. Phân tích Thành viên được giao
    let matchedUser: UserSummary | null = null;
    for (const u of users) {
      const nameLower = u.fullName.toLowerCase();
      const emailLower = u.email.toLowerCase();
      const firstName = nameLower.split(' ').pop() || nameLower;

      if (
        (firstName.length > 1 && textLower.includes(`cho ${firstName}`)) ||
        (firstName.length > 1 && textLower.includes(`giao cho ${firstName}`)) ||
        textLower.includes(nameLower) ||
        textLower.includes(emailLower)
      ) {
        matchedUser = u;
        break;
      }
    }

    // 3. Phân tích Dự án
    let matchedProject: ProjectSummary | null = null;
    for (const p of projects) {
      const pNameLower = p.name.toLowerCase();
      if (textLower.includes(pNameLower)) {
        matchedProject = p;
        break;
      }
    }

    // 4. Phân tích Deadline tương đối
    let dueDateStr: string | null = null;
    const targetDate = new Date(today);

    if (textLower.includes('hôm nay')) {
      dueDateStr = targetDate.toISOString().split('T')[0];
    } else if (textLower.includes('ngày mai')) {
      targetDate.setDate(targetDate.getDate() + 1);
      dueDateStr = targetDate.toISOString().split('T')[0];
    } else if (textLower.includes('ngày kia') || textLower.includes('hôm kia')) {
      targetDate.setDate(targetDate.getDate() + 2);
      dueDateStr = targetDate.toISOString().split('T')[0];
    } else if (textLower.includes('tuần sau') || textLower.includes('cuối tuần')) {
      targetDate.setDate(targetDate.getDate() + 7);
      dueDateStr = targetDate.toISOString().split('T')[0];
    }

    // 5. Chuẩn hóa tiêu đề
    let cleanTitle = rawText.replace(/^(tạo task|tạo nhiệm vụ|tạo công việc|thêm việc|thêm task|tạo)\s+/i, '').trim();
    if (!cleanTitle) {
      cleanTitle = rawText;
    }
    // Viết hoa chữ cái đầu
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    return {
      title: cleanTitle,
      description: null,
      priority,
      projectName: matchedProject?.name || null,
      assigneeEmail: matchedUser?.email || null,
      assigneeName: matchedUser?.fullName || null,
      dueDate: dueDateStr,
    };
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
      const groqClient = this.getGroqClient();

      const projects: ProjectSummary[] = await this.prisma.project.findMany({
        where: { isDeleted: false },
        select: { id: true, name: true },
      });

      const users: UserSummary[] = await this.prisma.user.findMany({
        where: { isActive: true },
        select: { id: true, email: true, fullName: true },
      });

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentDayOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][
        now.getDay()
      ];

      const prompt = `
Bạn là trợ lý ảo thông minh Solaris AI, chịu trách nhiệm phân tích khẩu lệnh tiếng Việt của người dùng để trích xuất thông tin tạo Task (Công việc).

Thời điểm hiện tại: ${todayStr} (${currentDayOfWeek}).

Danh sách Dự án đang có trong hệ thống:
${JSON.stringify(projects.map((p) => ({ id: p.id, name: p.name })))}

Danh sách Thành viên đang có trong hệ thống:
${JSON.stringify(users.map((u) => ({ id: u.id, email: u.email, fullName: u.fullName })))}

Câu lệnh giọng nói của người dùng:
"${rawAudioText}"

Hãy phân tích kỹ câu lệnh và trả về JSON thuần túy (không kèm bất kỳ văn bản giải thích hoặc code block nào) với cấu trúc sau:
{
  "title": "Tiêu đề công việc ngắn gọn, rõ nghĩa (Bắt buộc)",
  "description": "Mô tả chi tiết nội dung công việc nếu người dùng có nói, hoặc null",
  "priority": "LOW" | "NORMAL" | "IMPORTANT" | "URGENT",
  "projectName": "Tên dự án trong danh sách khớp nhất với câu lệnh, hoặc null",
  "assigneeEmail": "Email của thành viên trong danh sách được nhắc đến (ví dụ: 'giao cho Nam', 'cho An'), hoặc null",
  "assigneeName": "Tên thành viên nếu có, hoặc null",
  "dueDate": "YYYY-MM-DD nếu có thời hạn (ví dụ: 'ngày mai' -> tính toán ngày tiếp theo từ hôm nay ${todayStr}, 'thứ hai tuần sau', 'cuối tuần'), hoặc null"
}

Quy tắc phân loại priority:
- "khẩn cấp", "gấp", "ngay", "urgent" -> "URGENT"
- "quan trọng", "ưu tiên", "important" -> "IMPORTANT"
- "thấp", "khi nào rảnh làm", "low" -> "LOW"
- Các trường hợp khác -> "NORMAL"
      `.trim();

      let aiResult: AiTaskResult = {
        title: rawAudioText.slice(0, 100),
        priority: 'NORMAL',
      };

      // Danh sách các model fallback khả dĩ trên Groq
      const candidateModels = [
        await this.resolveGroqModel(groqClient),
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'llama3-70b-8192',
        'llama3-8b-8192',
        'mixtral-8x7b-32768',
        'gemma2-9b-it',
      ];
      const uniqueCandidates = Array.from(new Set(candidateModels));

      let completion: OpenAI.Chat.Completions.ChatCompletion | null = null;
      let lastModelError: string | null = null;

      for (const modelToTry of uniqueCandidates) {
        try {
          completion = await groqClient.chat.completions.create({
            model: modelToTry,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
          });
          if (completion) {
            this.cachedModel = modelToTry;
            break;
          }
        } catch (modelErr: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          lastModelError = modelErr instanceof Error ? modelErr.message : String(modelErr);
          console.warn(`Groq model ${modelToTry} failed: ${lastModelError}. Thử model tiếp theo...`);
        }
      }

      if (completion?.choices?.[0]?.message?.content) {
        const cleanJsonText = completion.choices[0].message.content
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        try {
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
          }
        } catch (parseErr: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          const message = parseErr instanceof Error ? parseErr.message : String(parseErr);
          console.error('JSON parse error from Groq response:', cleanJsonText, message);
          aiResult = this.fallbackRuleBasedParser(rawAudioText, projects, users, now);
        }
      } else {
        // Nếu tất cả model Groq đều không truy cập được (404 hoặc mạng), sử dụng Smart Fallback Parser
        console.warn('Tất cả Groq model đều không khả dụng, kích hoạt Smart Fallback Parser');
        aiResult = this.fallbackRuleBasedParser(rawAudioText, projects, users, now);
      }

      // Xác định dự án mục tiêu
      let targetProjectId = projects[0]?.id;
      if (aiResult.projectName) {
        const targetName = aiResult.projectName.toLowerCase();
        const foundProj = projects.find(
          (p) => p.name.toLowerCase().includes(targetName) || targetName.includes(p.name.toLowerCase())
        );
        if (foundProj) {
          targetProjectId = foundProj.id;
        }
      }

      if (!targetProjectId) {
        throw new NotFoundException(
          'Hệ thống chưa có dự án nào. Vui lòng tạo ít nhất 1 dự án trước khi tạo task bằng giọng nói.'
        );
      }

      // Xác định người được giao việc
      let targetAssigneeId: string | null = null;
      if (aiResult.assigneeEmail) {
        const targetEmail = aiResult.assigneeEmail.toLowerCase();
        const foundUser = users.find((u) => u.email.toLowerCase() === targetEmail);
        if (foundUser) {
          targetAssigneeId = foundUser.id;
        }
      }

      if (!targetAssigneeId && (aiResult.assigneeName || aiResult.assigneeEmail)) {
        const queryName = (aiResult.assigneeName || aiResult.assigneeEmail || '').toLowerCase();
        const foundUser = users.find(
          (u) =>
            u.fullName.toLowerCase().includes(queryName) ||
            queryName.includes(u.fullName.toLowerCase()) ||
            u.email.toLowerCase().includes(queryName)
        );
        if (foundUser) {
          targetAssigneeId = foundUser.id;
        }
      }

      // Nếu không tìm thấy ai thì giao cho chính người tạo
      if (!targetAssigneeId) {
        targetAssigneeId = userId;
      }

      let parsedDueDate: Date | null = null;
      if (aiResult.dueDate) {
        const d = new Date(aiResult.dueDate);
        if (!isNaN(d.getTime())) {
          parsedDueDate = d;
        }
      }

      const rawPriority = (aiResult.priority || 'NORMAL').toUpperCase();
      let priority: TaskPriority = TaskPriority.NORMAL;
      if (rawPriority === 'LOW') {
        priority = TaskPriority.LOW;
      } else if (rawPriority === 'IMPORTANT') {
        priority = TaskPriority.IMPORTANT;
      } else if (rawPriority === 'URGENT') {
        priority = TaskPriority.URGENT;
      }

      const newTask = await this.prisma.task.create({
        data: {
          title: aiResult.title || rawAudioText,
          description: aiResult.description || null,
          priority,
          dueDate: parsedDueDate,
          projectId: targetProjectId,
          assigneeId: targetAssigneeId,
          createdById: userId,
          rawVoice: rawAudioText,
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
          parsedJson: JSON.stringify(aiResult),
          status: VoiceLogStatus.SUCCESS,
          processingTimeMs,
          projectId: targetProjectId,
          taskId: newTask.id,
        },
      });

      // Real-time Socket Broadcast & Thông báo
      if (newTask.projectId) {
        this.socketGateway.broadcastToProject(newTask.projectId, 'task:created', newTask);
      }

      if (newTask.assigneeId && newTask.assigneeId !== userId) {
        await this.notificationService.sendNotification({
          userId: newTask.assigneeId,
          actorId: userId,
          title: '🎙️ Bạn được giao Task mới qua Giọng nói',
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
        parsedData: aiResult,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const processingTimeMs = Date.now() - startTime;

      try {
        await this.prisma.voiceCommandLog.update({
          where: { id: voiceLog.id },
          data: {
            status: VoiceLogStatus.FAILED,
            errorMessage,
            processingTimeMs,
          },
        });
      } catch (logErr: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const message = logErr instanceof Error ? logErr.message : String(logErr);
        console.error('Error updating voiceCommandLog failure:', message);
      }

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(`Lỗi khi phân tích giọng nói qua Groq AI: ${errorMessage}`);
    }
  }
}
