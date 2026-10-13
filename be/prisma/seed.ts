import * as dotenv from 'dotenv';
dotenv.config();

import {
  PrismaClient,
  Role,
  Profession,
  UserStatusSignal,
  TaskStatus,
  TaskPriority,
  NotificationType,
  WorkType,
  WorkShift,
  LeaveType,
  LeaveStatus,
  VoiceLogStatus,
} from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const dbUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres:your_password_here@localhost:5432/task_management_db?schema=public';
const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Bắt đầu khởi tạo luồng Seed Data mẫu SOLARIS phục vụ Demo...');

  // 1. Phòng ban
  const deptProduct = await prisma.department.upsert({
    where: { code: 'PRODUCT' },
    update: { name: 'Product Engineering', description: 'Phòng Quản lý & Phát triển Sản phẩm Nền tảng' },
    create: {
      name: 'Product Engineering',
      code: 'PRODUCT',
      description: 'Phòng Quản lý & Phát triển Sản phẩm Nền tảng',
    },
  });

  const deptClient = await prisma.department.upsert({
    where: { code: 'CLIENT' },
    update: { name: 'Client Solutions', description: 'Phòng Quản lý Khách hàng & Triển khai Dự án Enterprise' },
    create: {
      name: 'Client Solutions',
      code: 'CLIENT',
      description: 'Phòng Quản lý Khách hàng & Triển khai Dự án Enterprise',
    },
  });

  // 2. Chuẩn bị 3 Tài khoản Demo
  const defaultPassword = await bcrypt.hash('password123', 10);
  const huyDatPassword = await bcrypt.hash('11032005', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'huydatne@gmail.com' },
    update: {
      id: 'admin-huydat-id',
      password: huyDatPassword,
      role: Role.ADMIN,
      profession: Profession.DEV,
      jobTitle: 'System Architect & Lead Admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      coverImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
      phone: '+84 988 123 456',
      bio: 'Chuyên gia thiết kế kiến trúc hệ thống SOLARIS Task Board & Voice Assistant.',
      statusSignal: UserStatusSignal.ONLINE,
      customStatus: '🟢 Đang kiến trúc hệ thống SOLARIS Core...',
      departmentId: deptProduct.id,
    },
    create: {
      id: 'admin-huydat-id',
      email: 'huydatne@gmail.com',
      password: huyDatPassword,
      fullName: 'Huy Dat (Admin)',
      role: Role.ADMIN,
      profession: Profession.DEV,
      jobTitle: 'System Architect & Lead Admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      coverImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
      phone: '+84 988 123 456',
      bio: 'Chuyên gia thiết kế kiến trúc hệ thống SOLARIS Task Board & Voice Assistant.',
      statusSignal: UserStatusSignal.ONLINE,
      customStatus: '🟢 Đang kiến trúc hệ thống SOLARIS Core...',
      departmentId: deptProduct.id,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@taskboard.com' },
    update: {
      id: 'manager-minhanh-id',
      password: defaultPassword,
      role: Role.MANAGER,
      profession: Profession.PRODUCT_OWNER,
      jobTitle: 'Senior Project Manager & Agile Coach',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
      customStatus: '📅 Đang duyệt bàn giao & điều phối Sprint...',
      departmentId: deptProduct.id,
    },
    create: {
      id: 'manager-minhanh-id',
      email: 'manager@taskboard.com',
      password: defaultPassword,
      fullName: 'Minh Anh (Manager)',
      role: Role.MANAGER,
      profession: Profession.PRODUCT_OWNER,
      jobTitle: 'Senior Project Manager & Agile Coach',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
      customStatus: '📅 Đang duyệt bàn giao & điều phối Sprint...',
      departmentId: deptProduct.id,
    },
  });

  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@taskboard.com' },
    update: {
      id: 'employee-hoangnam-id',
      password: defaultPassword,
      role: Role.EMPLOYEE,
      profession: Profession.DEV,
      jobTitle: 'Full-stack Developer (React 19 & NestJS)',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
      customStatus: '💻 Đang thực hiện nhiệm vụ & gửi nghiệm thu...',
      departmentId: deptClient.id,
    },
    create: {
      id: 'employee-hoangnam-id',
      email: 'employee@taskboard.com',
      password: defaultPassword,
      fullName: 'Hoang Nam (Developer)',
      role: Role.EMPLOYEE,
      profession: Profession.DEV,
      jobTitle: 'Full-stack Developer (React 19 & NestJS)',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
      customStatus: '💻 Đang thực hiện nhiệm vụ & gửi nghiệm thu...',
      departmentId: deptClient.id,
    },
  });

  // 3. Dự án chuẩn demo
  const projectDemo = await prisma.project.upsert({
    where: { id: 'project-solaris-demo' },
    update: {
      name: 'SOLARIS - Task Board & Smart Workflow',
      description: 'Dự án mẫu thể hiện quy trình phát triển: Khẩu lệnh AI, Kéo thả Kanban, Nghiệm thu Subtask, Bàn giao và Lịch trình WFH.',
      createdById: adminUser.id,
      managerId: managerUser.id,
      stagesJson: JSON.stringify([
        { id: 'stage_1', name: 'Giai Đoạn 1: Phân Tích & Yêu Cầu', order: 1 },
        { id: 'stage_2', name: 'Giai Đoạn 2: Thiết Kế & Kiến Trúc', order: 2 },
        { id: 'stage_3', name: 'Giai Đoạn 3: Lập Trình Frontend/Backend', order: 3 },
        { id: 'stage_4', name: 'Giai Đoạn 4: Kiểm Thử QA/QC', order: 4 },
        { id: 'stage_5', name: 'Giai Đoạn 5: Nghiệm Thu & Triển Khai', order: 5 },
        { id: 'stage_6', name: 'Giai Đoạn 6: Hoàn Tất Bàn Giao', order: 6 },
      ]),
    },
    create: {
      id: 'project-solaris-demo',
      name: 'SOLARIS - Task Board & Smart Workflow',
      description: 'Dự án mẫu thể hiện quy trình phát triển: Khẩu lệnh AI, Kéo thả Kanban, Nghiệm thu Subtask, Bàn giao và Lịch trình WFH.',
      createdById: adminUser.id,
      managerId: managerUser.id,
      stagesJson: JSON.stringify([
        { id: 'stage_1', name: 'Giai Đoạn 1: Phân Tích & Yêu Cầu', order: 1 },
        { id: 'stage_2', name: 'Giai Đoạn 2: Thiết Kế & Kiến Trúc', order: 2 },
        { id: 'stage_3', name: 'Giai Đoạn 3: Lập Trình Frontend/Backend', order: 3 },
        { id: 'stage_4', name: 'Giai Đoạn 4: Kiểm Thử QA/QC', order: 4 },
        { id: 'stage_5', name: 'Giai Đoạn 5: Nghiệm Thu & Triển Khai', order: 5 },
        { id: 'stage_6', name: 'Giai Đoạn 6: Hoàn Tất Bàn Giao', order: 6 },
      ]),
    },
  });

  // Thành viên tham gia dự án
  for (const user of [adminUser, managerUser, employeeUser]) {
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: projectDemo.id, userId: user.id } },
      update: {},
      create: { projectId: projectDemo.id, userId: user.id },
    });
  }

  // 4. Các Tags dự án
  const tagFrontend = await prisma.tag.upsert({
    where: { id: 'tag-frontend' },
    update: {},
    create: { id: 'tag-frontend', name: 'Frontend', color: 'blue', projectId: projectDemo.id },
  });

  const tagBackend = await prisma.tag.upsert({
    where: { id: 'tag-backend' },
    update: {},
    create: { id: 'tag-backend', name: 'Backend', color: 'rose', projectId: projectDemo.id },
  });

  const tagAi = await prisma.tag.upsert({
    where: { id: 'tag-ai' },
    update: {},
    create: { id: 'tag-ai', name: 'AI Voice', color: 'amber', projectId: projectDemo.id },
  });

  const tagSecurity = await prisma.tag.upsert({
    where: { id: 'tag-security' },
    update: {},
    create: { id: 'tag-security', name: 'Security', color: 'purple', projectId: projectDemo.id },
  });

  const now = new Date();
  const getOffsetDate = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  };

  // 5. Chuỗi nhiệm vụ thể hiện đầy đủ 6 cột Kanban & các tính năng nghiệp vụ
  // TASK 1 (TODO): Được tạo từ giọng nói AI
  const task1 = await prisma.task.upsert({
    where: { id: 'demo-task-1-voice' },
    update: {},
    create: {
      id: 'demo-task-1-voice',
      title: 'Tích Hợp Whisper & LLaMA Xử Lý Khẩu Lệnh Tiếng Việt',
      description: 'Hỗ trợ nhận diện câu lệnh giọng nói: tự động trích xuất tiêu đề, người thực hiện, thời hạn và mức độ ưu tiên theo đúng quy trình slide.',
      status: TaskStatus.TODO,
      priority: TaskPriority.URGENT,
      progress: 0,
      startDate: now,
      dueDate: getOffsetDate(3),
      rawVoice: 'Tạo task tích hợp Whisper và LLaMA xử lý khẩu lệnh tiếng Việt cho Nam deadline 3 ngày tới mức độ khẩn cấp',
      projectId: projectDemo.id,
      createdById: managerUser.id,
      assigneeId: employeeUser.id,
      stageId: 'stage_1',
    },
  });

  // TASK 2 (IN_PROGRESS): Có Subtask nghiệm thu (1 duyệt xong, 1 đang chờ Quản lý duyệt, 1 chưa làm)
  const task2 = await prisma.task.upsert({
    where: { id: 'demo-task-2-subtask' },
    update: {},
    create: {
      id: 'demo-task-2-subtask',
      title: 'Tối Ưu Kéo Thả Kanban & Phân Tách Component Tránh Giật Lag',
      description: 'Thực thi giao diện kéo thả mượt mà với React 19 và @hello-pangea/dnd, loại bỏ giật màn hình và tối ưu kích thước thẻ việc.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.IMPORTANT,
      progress: 60,
      startDate: getOffsetDate(-2),
      dueDate: getOffsetDate(2),
      projectId: projectDemo.id,
      createdById: adminUser.id,
      assigneeId: employeeUser.id,
      stageId: 'stage_3',
    },
  });

  // TASK 3 (PAUSED): Nhiệm vụ đang tạm dừng chờ tài nguyên
  const task3 = await prisma.task.upsert({
    where: { id: 'demo-task-3-paused' },
    update: {},
    create: {
      id: 'demo-task-3-paused',
      title: 'Đồng Bộ Lịch Trình Lên Google Calendar & Webhook Outlook',
      description: 'Tạm dừng do đang chờ cấp phép quyền Google OAuth Client ID từ tài khoản quản trị tập đoàn.',
      status: TaskStatus.PAUSED,
      priority: TaskPriority.NORMAL,
      progress: 30,
      startDate: getOffsetDate(-4),
      dueDate: getOffsetDate(5),
      projectId: projectDemo.id,
      createdById: managerUser.id,
      assigneeId: employeeUser.id,
      stageId: 'stage_2',
    },
  });

  // TASK 4 (BLOCKED): Nhiệm vụ bị nghẽn
  const task4 = await prisma.task.upsert({
    where: { id: 'demo-task-4-blocked' },
    update: {},
    create: {
      id: 'demo-task-4-blocked',
      title: 'Kiểm Thử Tải File Đính Kèm Vượt Ngưỡng 100MB Trên Hạ Tầng Staging',
      description: 'Bị tắc nghẽn do dung lượng ổ cứng môi trường kiểm thử chưa được mở rộng để lưu trữ file đa phương tiện lớn.',
      status: TaskStatus.BLOCKED,
      priority: TaskPriority.IMPORTANT,
      progress: 25,
      startDate: getOffsetDate(-3),
      dueDate: getOffsetDate(1),
      projectId: projectDemo.id,
      createdById: managerUser.id,
      assigneeId: employeeUser.id,
      stageId: 'stage_4',
    },
  });

  // TASK 5 (IN_REVIEW): Nhiệm vụ đang có yêu cầu BÀN GIAO (TRANSFER REQUEST) chờ Quản lý duyệt
  const task5 = await prisma.task.upsert({
    where: { id: 'demo-task-5-transfer' },
    update: {},
    create: {
      id: 'demo-task-5-transfer',
      title: 'Nghiệm Thu Bàn Giao Module Phân Quyền RBAC & Thùng Rác 14 Ngày',
      description: 'Nhân viên Hoang Nam đã hoàn thành phát triển tính năng lưu đệm 14 ngày, gửi yêu cầu bàn giao lại cho Quản lý Minh Anh nghiệm thu giai đoạn.',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.NORMAL,
      progress: 90,
      startDate: getOffsetDate(-5),
      dueDate: getOffsetDate(1),
      projectId: projectDemo.id,
      createdById: managerUser.id,
      assigneeId: employeeUser.id,
      stageId: 'stage_5',
    },
  });

  // TASK 6 (DONE): Nhiệm vụ đã hoàn thành 100%
  const task6 = await prisma.task.upsert({
    where: { id: 'demo-task-6-done' },
    update: {},
    create: {
      id: 'demo-task-6-done',
      title: 'Kiến Trúc End-to-End TypeScript & Thiết Lập 14 Bảng Quan Hệ PostgreSQL',
      description: 'Đã hoàn tất cấu trúc NestJS 11 + Prisma ORM + PostgreSQL với Soft-delete bảo vệ dữ liệu chống xóa nhầm.',
      status: TaskStatus.DONE,
      priority: TaskPriority.IMPORTANT,
      progress: 100,
      startDate: getOffsetDate(-7),
      dueDate: getOffsetDate(-1),
      completedAt: getOffsetDate(-1),
      projectId: projectDemo.id,
      createdById: adminUser.id,
      assigneeId: adminUser.id,
      stageId: 'stage_6',
    },
  });

  // TASK 7 (TRASH): Đã bị xóa tạm thời vào Thùng rác để demo tính năng khôi phục trong 14 ngày
  const task7 = await prisma.task.upsert({
    where: { id: 'demo-task-7-trash' },
    update: {},
    create: {
      id: 'demo-task-7-trash',
      title: 'Bản Nháp Thử Nghiệm Giao Diện Kính Mờ Đêm Vũ Trụ v1.0',
      description: 'Thẻ việc nháp được đưa vào thùng rác để kiểm thử tính năng lưu tạm 14 ngày và khôi phục nguyên trạng.',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      progress: 0,
      isDeleted: true,
      deletedAt: now,
      projectId: projectDemo.id,
      createdById: adminUser.id,
      assigneeId: employeeUser.id,
      stageId: 'stage_1',
    },
  });

  // Gán Thẻ nhãn (Task Tags)
  await prisma.taskTag.upsert({
    where: { taskId_tagId: { taskId: task1.id, tagId: tagAi.id } },
    update: {},
    create: { taskId: task1.id, tagId: tagAi.id },
  });
  await prisma.taskTag.upsert({
    where: { taskId_tagId: { taskId: task2.id, tagId: tagFrontend.id } },
    update: {},
    create: { taskId: task2.id, tagId: tagFrontend.id },
  });
  await prisma.taskTag.upsert({
    where: { taskId_tagId: { taskId: task5.id, tagId: tagSecurity.id } },
    update: {},
    create: { taskId: task5.id, tagId: tagSecurity.id },
  });
  await prisma.taskTag.upsert({
    where: { taskId_tagId: { taskId: task6.id, tagId: tagBackend.id } },
    update: {},
    create: { taskId: task6.id, tagId: tagBackend.id },
  });

  // 6. Subtasks (Minitasks) với quy trình nộp duyệt và phê duyệt rõ ràng
  // Subtask 1: Đã được Quản lý duyệt APPROVED
  await prisma.subtask.upsert({
    where: { id: 'sub-2-1' },
    update: {},
    create: {
      id: 'sub-2-1',
      taskId: task2.id,
      title: 'Cài đặt thư viện @hello-pangea/dnd và cấu hình DragDropContext',
      isDone: true,
      isUrgent: false,
      approvalStatus: 'APPROVED',
      order: 0,
      assigneeId: employeeUser.id,
      estimatedDays: 1,
    },
  });

  // Subtask 2: Nhân viên đã nộp nghiệm thu -> Trạng thái PENDING chờ Quản lý duyệt
  await prisma.subtask.upsert({
    where: { id: 'sub-2-2' },
    update: {},
    create: {
      id: 'sub-2-2',
      taskId: task2.id,
      title: 'Tách giao diện Kanban thành các view độc lập (BoardView, FocusCockpit, Pipeline)',
      isDone: false,
      isUrgent: true,
      approvalStatus: 'PENDING',
      order: 1,
      assigneeId: employeeUser.id,
      estimatedDays: 1,
    },
  });

  // Subtask 3: Đang thực hiện, chưa nộp
  await prisma.subtask.upsert({
    where: { id: 'sub-2-3' },
    update: {},
    create: {
      id: 'sub-2-3',
      taskId: task2.id,
      title: 'Kiểm thử thao tác kéo thẻ thả sang cột khác và cập nhật tiến độ tự động',
      isDone: false,
      isUrgent: false,
      approvalStatus: 'NONE',
      order: 2,
      assigneeId: employeeUser.id,
      estimatedDays: 1,
    },
  });

  // Yêu cầu duyệt Subtask (SUBTASK_APPROVAL request) liên kết với sub-2-2
  await prisma.taskRequest.upsert({
    where: { id: 'req-subtask-approval-2-2' },
    update: {},
    create: {
      id: 'req-subtask-approval-2-2',
      taskId: task2.id,
      senderId: employeeUser.id,
      receiverId: managerUser.id,
      type: 'SUBTASK_APPROVAL',
      status: 'PENDING',
      note: '[Xác thực hoàn thành] Tách giao diện Kanban thành các view độc lập (SubtaskId: sub-2-2)',
    },
  });

  // 7. Yêu cầu chuyển giao nhiệm vụ (TASK TRANSFER) trên Task 5
  await prisma.taskRequest.upsert({
    where: { id: 'req-transfer-task-5' },
    update: {},
    create: {
      id: 'req-transfer-task-5',
      taskId: task5.id,
      senderId: employeeUser.id,
      receiverId: managerUser.id,
      type: 'TRANSFER',
      status: 'PENDING',
      note: 'Kính gửi Quản lý Minh Anh, em đã hoàn thành tích hợp cơ chế lưu đệm 14 ngày trong Thùng rác. Kính nhờ anh nghiệm thu và nhận bàn giao nhiệm vụ!',
    },
  });

  // 8. Bình luận trao đổi & Tệp đính kèm
  await prisma.comment.upsert({
    where: { id: 'comment-demo-1' },
    update: {},
    create: {
      id: 'comment-demo-1',
      taskId: task2.id,
      userId: employeeUser.id,
      content: 'Em đã tách file BoardPage từ 2.100 dòng xuống còn dưới 860 dòng và tối ưu kéo thả không bị giật lag anh nhé @Minh Anh (Manager)',
    },
  });

  await prisma.comment.upsert({
    where: { id: 'comment-demo-2' },
    update: {},
    create: {
      id: 'comment-demo-2',
      taskId: task2.id,
      userId: managerUser.id,
      content: 'Rất tốt Nam! Anh đang xem lại phần nghiệm thu subtask và sẽ xác nhận ngay trong buổi họp sprint chiều nay.',
    },
  });

  await prisma.attachment.upsert({
    where: { id: 'att-demo-1' },
    update: {},
    create: {
      id: 'att-demo-1',
      taskId: task2.id,
      name: 'SOLARIS_Architecture_Pattern_Guide.pdf',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      type: 'file',
      size: '1.8 MB',
    },
  });

  await prisma.attachment.upsert({
    where: { id: 'att-demo-2' },
    update: {},
    create: {
      id: 'att-demo-2',
      taskId: task1.id,
      name: 'Figma Design System - SOLARIS Dark Cosmic',
      url: 'https://figma.com/@solaris/demo-workspace',
      type: 'link',
      size: 'Cloud Link',
    },
  });

  // 9. Lịch làm việc & Đơn nghỉ phép/WFH (Thể hiện Slide 4)
  // Lịch trực của nhân viên Hoang Nam trong tuần này
  const dateToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const dateDayAfter = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

  // Đơn đăng ký WFH (Làm từ xa) đang chờ duyệt
  const leaveReqWfh = await prisma.leaveRequest.upsert({
    where: { id: 'leave-req-wfh-demo' },
    update: {},
    create: {
      id: 'leave-req-wfh-demo',
      userId: employeeUser.id,
      type: LeaveType.WFH,
      startDate: dateTomorrow,
      endDate: dateTomorrow,
      shift: WorkShift.FULL_DAY,
      reason: 'Đăng ký làm việc từ xa (WFH) để tập trung cao độ tối ưu hóa hiệu năng Voice Assistant.',
      handoverPlan: 'Mọi trao đổi và nghiệm thu task con vẫn hoạt động bình thường qua kênh chat & Socket SOLARIS.',
      status: LeaveStatus.PENDING,
    },
  });

  // Lịch trực văn phòng hôm nay của 3 người
  await prisma.workSchedule.upsert({
    where: { userId_date_shift: { userId: adminUser.id, date: dateToday, shift: WorkShift.FULL_DAY } },
    update: {},
    create: {
      userId: adminUser.id,
      date: dateToday,
      workType: WorkType.OFFICE,
      shift: WorkShift.FULL_DAY,
      note: 'Trực kỹ thuật hệ thống Core & Server',
      createdById: adminUser.id,
    },
  });

  await prisma.workSchedule.upsert({
    where: { userId_date_shift: { userId: managerUser.id, date: dateToday, shift: WorkShift.FULL_DAY } },
    update: {},
    create: {
      userId: managerUser.id,
      date: dateToday,
      workType: WorkType.OFFICE,
      shift: WorkShift.FULL_DAY,
      note: 'Điều phối sprint & duyệt bàn giao',
      createdById: managerUser.id,
    },
  });

  await prisma.workSchedule.upsert({
    where: { userId_date_shift: { userId: employeeUser.id, date: dateToday, shift: WorkShift.FULL_DAY } },
    update: {},
    create: {
      userId: employeeUser.id,
      date: dateToday,
      workType: WorkType.OFFICE,
      shift: WorkShift.FULL_DAY,
      note: 'Thực hiện nhiệm vụ sprint & kiểm thử kéo thả',
      createdById: managerUser.id,
    },
  });

  // 10. Nhật ký giọng nói AI (Voice Command Log thể hiện Slide 6)
  await prisma.voiceCommandLog.upsert({
    where: { id: 'voice-log-demo-1' },
    update: {},
    create: {
      id: 'voice-log-demo-1',
      userId: managerUser.id,
      projectId: projectDemo.id,
      taskId: task1.id,
      rawAudioText: 'Tạo task tích hợp Whisper và LLaMA xử lý khẩu lệnh tiếng Việt cho Nam deadline 3 ngày tới mức độ khẩn cấp',
      intent: 'CREATE_TASK',
      parsedJson: JSON.stringify({
        title: 'Tích Hợp Whisper & LLaMA Xử Lý Khẩu Lệnh Tiếng Việt',
        assignee: 'Hoang Nam (Developer)',
        priority: 'URGENT',
        dueDate: getOffsetDate(3).toISOString().slice(0, 10),
      }),
      status: VoiceLogStatus.SUCCESS,
      processingTimeMs: 420,
    },
  });

  // 11. Thông báo hệ thống cho Manager và Employee
  await prisma.notification.upsert({
    where: { id: 'notif-demo-1' },
    update: {},
    create: {
      id: 'notif-demo-1',
      userId: managerUser.id,
      actorId: employeeUser.id,
      title: 'Yêu cầu chuyển giao nhiệm vụ mới',
      content: 'Hoang Nam đã gửi yêu cầu bàn giao Task "Nghiệm Thu Bàn Giao Module Phân Quyền RBAC & Thùng Rác 14 Ngày".',
      type: NotificationType.TASK_TRANSFER_REQUEST,
      taskId: task5.id,
      projectId: projectDemo.id,
      isRead: false,
    },
  });

  await prisma.notification.upsert({
    where: { id: 'notif-demo-2' },
    update: {},
    create: {
      id: 'notif-demo-2',
      userId: managerUser.id,
      actorId: employeeUser.id,
      title: 'Nghiệm thu việc con (Subtask)',
      content: 'Hoang Nam đã hoàn thành việc con "Tách giao diện Kanban thành các view độc lập" và yêu cầu phê duyệt.',
      type: NotificationType.SUBTASK_APPROVAL_REQUEST,
      taskId: task2.id,
      subtaskId: 'sub-2-2',
      projectId: projectDemo.id,
      isRead: false,
    },
  });

  await prisma.notification.upsert({
    where: { id: 'notif-demo-3' },
    update: {},
    create: {
      id: 'notif-demo-3',
      userId: employeeUser.id,
      actorId: managerUser.id,
      title: 'Nhiệm vụ mới được phân công từ giọng nói AI',
      content: 'Quản lý Minh Anh đã phân công bạn phụ trách Task "Tích Hợp Whisper & LLaMA Xử Lý Khẩu Lệnh Tiếng Việt".',
      type: NotificationType.TASK_ASSIGNED,
      taskId: task1.id,
      projectId: projectDemo.id,
      isRead: false,
    },
  });

  console.log('✨ Khởi tạo luồng Seed Data mẫu SOLARIS hoàn tất thành công 100%!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi khởi tạo seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
