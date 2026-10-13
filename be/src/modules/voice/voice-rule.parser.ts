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

export class VoiceRuleParser {
  static normalizeVietnamese(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  }

  static parse(
    rawText: string,
    projects: ProjectSummary[],
    users: UserSummary[],
    today: Date
  ): AiTaskResult {
    const textLower = rawText.toLowerCase();
    const textNormalized = this.normalizeVietnamese(rawText);

    let priority = 'NORMAL';
    if (
      textLower.includes('khẩn cấp') ||
      textLower.includes('gấp') ||
      textLower.includes('ngay lập tức') ||
      textLower.includes('urgent') ||
      textLower.includes('emergency') ||
      textLower.includes('asap')
    ) {
      priority = 'URGENT';
    } else if (
      textLower.includes('quan trọng') ||
      textLower.includes('ưu tiên') ||
      textLower.includes('important') ||
      textLower.includes('high priority') ||
      textLower.includes('high')
    ) {
      priority = 'IMPORTANT';
    } else if (
      textLower.includes('thấp') ||
      textLower.includes('rảnh làm') ||
      textLower.includes('low priority') ||
      textLower.includes('low')
    ) {
      priority = 'LOW';
    }

    let matchedUser: UserSummary | null = null;
    let extractedAssigneeName: string | null = null;

    for (const u of users) {
      const cleanFullName = u.fullName.replace(/\s*\([^)]*\)/g, '').trim();
      const cleanNormalized = this.normalizeVietnamese(cleanFullName);
      const nameParts = cleanNormalized.split(/\s+/);
      const firstName = nameParts[nameParts.length - 1];

      const rxAssignee = new RegExp('(?:cho|giao cho|for|to|assign to)\\s+' + firstName + '\\b', 'i');
      const rxFullName = new RegExp('\\b' + cleanNormalized + '\\b', 'i');

      if (
        (firstName && rxAssignee.test(textNormalized)) ||
        rxFullName.test(textNormalized) ||
        textLower.includes(u.email.toLowerCase())
      ) {
        matchedUser = u;
        extractedAssigneeName = cleanFullName;
        break;
      }
    }

    if (!matchedUser) {
      const assigneeRegex = /(?:giao cho|cho|assign to|for|to)\s+([a-zA-Z0-9_\u00C0-\u1EF9]+)/i;
      const assigneeMatch = rawText.match(assigneeRegex);
      if (assigneeMatch && assigneeMatch[1]) {
        extractedAssigneeName = assigneeMatch[1];
      }
    }

    let matchedProject: ProjectSummary | null = null;
    for (const p of projects) {
      const pNameLower = p.name.toLowerCase();
      if (textLower.includes(pNameLower)) {
        matchedProject = p;
        break;
      }
    }

    let dueDateStr: string | null = null;
    const targetDate = new Date(today);

    if (textLower.includes('hôm nay') || textLower.includes('today')) {
      dueDateStr = targetDate.toISOString().split('T')[0];
    } else if (textLower.includes('ngày mai') || textLower.includes('tomorrow')) {
      targetDate.setDate(targetDate.getDate() + 1);
      dueDateStr = targetDate.toISOString().split('T')[0];
    } else if (
      textLower.includes('ngày kia') ||
      textLower.includes('hôm kia') ||
      textLower.includes('the day after tomorrow')
    ) {
      targetDate.setDate(targetDate.getDate() + 2);
      dueDateStr = targetDate.toISOString().split('T')[0];
    } else if (
      textLower.includes('tuần sau') ||
      textLower.includes('cuối tuần') ||
      textLower.includes('next week') ||
      textLower.includes('weekend')
    ) {
      targetDate.setDate(targetDate.getDate() + 7);
      dueDateStr = targetDate.toISOString().split('T')[0];
    }

    let cleanTitle = rawText
      .replace(
        /^(tạo task|tạo nhiệm vụ|tạo công việc|thêm việc|thêm task|tạo việc|tạo|create task|create new task|add task|make task|new task)\s+/i,
        ''
      )
      .replace(
        /(?:mức độ|độ ưu tiên|priority|level)\s+(?:khẩn cấp|gấp|ngay lập tức|urgent|emergency|asap|quan trọng|ưu tiên|important|high|thấp|rảnh làm|low)/gi,
        ''
      )
      .replace(
        /\b(?:mức độ\s+khẩn cấp|khẩn cấp|mức độ\s+quan trọng|quan trọng|mức độ\s+thấp|thấp|urgent|important|low)\b/gi,
        ''
      )
      .replace(
        /(?:deadline|hạn chót|hạn hoàn thành|hạn|due date|due)\s+(?:hôm nay|ngày mai|ngày kia|hôm kia|tuần sau|cuối tuần|today|tomorrow|the day after tomorrow|next week|weekend)/gi,
        ''
      )
      .replace(/\b(?:deadline|hạn chót|hạn)\b/gi, '')
      .replace(
        /\b(?:hôm nay|ngày mai|ngày kia|hôm kia|tuần sau|cuối tuần|today|tomorrow|the day after tomorrow|next week|weekend)\b/gi,
        ''
      )
      .replace(/(?:giao cho|cho|assign to|for|to)\s+[a-zA-Z0-9_\u00C0-\u1EF9]+/gi, '')
      .replace(/(?:trong dự án|thuộc dự án|dự án|in project|project)\s+[a-zA-Z0-9_\u00C0-\u1EF9]+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanTitle || cleanTitle.length < 2) {
      cleanTitle = rawText.replace(/^(tạo task|tạo nhiệm vụ|tạo công việc|create task)\s+/i, '').trim();
    }
    if (!cleanTitle) {
      cleanTitle = rawText.trim();
    }
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    return {
      title: cleanTitle,
      description: null,
      priority,
      projectName: matchedProject?.name || null,
      assigneeEmail: matchedUser?.email || null,
      assigneeName: extractedAssigneeName,
      dueDate: dueDateStr,
    };
  }
}
