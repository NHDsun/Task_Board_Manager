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
  CallType,
  CallStatus,
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
  console.log('🌱 Starting comprehensive database seeding with full feature coverage...');

  // 1. Departments
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

  const deptAI = await prisma.department.upsert({
    where: { code: 'AI_LAB' },
    update: { name: 'AI Innovation Lab', description: 'Phòng Nghiên cứu Trí tuệ Nhân tạo & Xử lý Giọng nói' },
    create: {
      name: 'AI Innovation Lab',
      code: 'AI_LAB',
      description: 'Phòng Nghiên cứu Trí tuệ Nhân tạo & Xử lý Giọng nói',
    },
  });

  console.log('✅ Created Departments:', deptProduct.name, deptClient.name, deptAI.name);

  // 2. Users with Passwords
  const defaultPassword = await bcrypt.hash('password123', 10);
  const huyDatPassword = await bcrypt.hash('11032005', 10);

  const huyDatUser = await prisma.user.upsert({
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
      bio: 'Chuyên gia thiết kế kiến trúc hệ thống Solaris Task Board & AI Agent System.',
      statusSignal: UserStatusSignal.ONLINE,
      customStatus: '🟢 Đang kiến trúc hệ thống Solaris Core...',
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
      bio: 'Chuyên gia thiết kế kiến trúc hệ thống Solaris Task Board & AI Agent System.',
      statusSignal: UserStatusSignal.ONLINE,
      customStatus: '🟢 Đang kiến trúc hệ thống Solaris Core...',
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
      customStatus: '📅 Đang điều phối Sprint 42...',
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
      customStatus: '📅 Đang điều phối Sprint 42...',
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
      jobTitle: 'Senior Frontend Engineer (React 19 & Tailwind)',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
    },
    create: {
      id: 'employee-hoangnam-id',
      email: 'employee@taskboard.com',
      password: defaultPassword,
      fullName: 'Hoang Nam (Developer)',
      role: Role.EMPLOYEE,
      profession: Profession.DEV,
      jobTitle: 'Senior Frontend Engineer (React 19 & Tailwind)',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
      departmentId: deptClient.id,
    },
  });

  const empLanHuong = await prisma.user.upsert({
    where: { email: 'lanhuong@taskboard.com' },
    update: {
      password: defaultPassword,
      role: Role.EMPLOYEE,
      profession: Profession.TESTER,
      jobTitle: 'Lead QA & Automation Specialist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
    },
    create: {
      email: 'lanhuong@taskboard.com',
      password: defaultPassword,
      fullName: 'Lan Huong (QA Tester)',
      role: Role.EMPLOYEE,
      profession: Profession.TESTER,
      jobTitle: 'Lead QA & Automation Specialist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
      departmentId: deptProduct.id,
    },
  });

  const empDuyKhang = await prisma.user.upsert({
    where: { email: 'duykhang@taskboard.com' },
    update: {
      password: defaultPassword,
      role: Role.EMPLOYEE,
      profession: Profession.DESIGNER,
      jobTitle: 'Lead UI/UX Designer & 3D Artist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.BUSY,
      customStatus: '🎨 Đang vẽ thiết kế Bento Grid...',
    },
    create: {
      email: 'duykhang@taskboard.com',
      password: defaultPassword,
      fullName: 'Duy Khang (UI/UX Designer)',
      role: Role.EMPLOYEE,
      profession: Profession.DESIGNER,
      jobTitle: 'Lead UI/UX Designer & 3D Artist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.BUSY,
      customStatus: '🎨 Đang vẽ thiết kế Bento Grid...',
      departmentId: deptClient.id,
    },
  });

  const empThanhTung = await prisma.user.upsert({
    where: { email: 'thanhtung@taskboard.com' },
    update: {
      password: defaultPassword,
      role: Role.EMPLOYEE,
      profession: Profession.DEV,
      jobTitle: 'Backend Architect (NestJS & Prisma Postgres)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
    },
    create: {
      email: 'thanhtung@taskboard.com',
      password: defaultPassword,
      fullName: 'Thanh Tung (Backend Dev)',
      role: Role.EMPLOYEE,
      profession: Profession.DEV,
      jobTitle: 'Backend Architect (NestJS & Prisma Postgres)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
      departmentId: deptProduct.id,
    },
  });

  console.log('✅ Created/Updated Users with complete roles');

  // 3. Projects
  const projectCore = await prisma.project.upsert({
    where: { id: 'project-solaris-core-id' },
    update: {
      name: 'Solaris Task Board Core',
      description: 'Hệ thống Quản lý Nhiệm vụ Đêm Vũ Trụ tích hợp AI & Sinh trắc học Giọng nói',
      createdById: huyDatUser.id,
      managerId: managerUser.id,
    },
    create: {
      id: 'project-solaris-core-id',
      name: 'Solaris Task Board Core',
      description: 'Hệ thống Quản lý Nhiệm vụ Đêm Vũ Trụ tích hợp AI & Sinh trắc học Giọng nói',
      createdById: huyDatUser.id,
      managerId: managerUser.id,
    },
  });

  const projectUi = await prisma.project.upsert({
    where: { id: 'project-solaris-ui-id' },
    update: {
      name: 'Solaris UI/UX Bento Design',
      description: 'Nâng cấp Giao diện Thiết kế Glassmorphism & Tương tác Vuốt Chạm Đa Nền tảng',
      managerId: managerUser.id,
      createdById: huyDatUser.id,
    },
    create: {
      id: 'project-solaris-ui-id',
      name: 'Solaris UI/UX Bento Design',
      description: 'Nâng cấp Giao diện Thiết kế Glassmorphism & Tương tác Vuốt Chạm Đa Nền tảng',
      createdById: huyDatUser.id,
      managerId: managerUser.id,
    },
  });

  const projectAI = await prisma.project.upsert({
    where: { id: 'project-voice-ai-id' },
    update: {
      name: 'AI Voice Command & Biometrics Engine',
      description: 'Mô hình Cục bộ Ollama Qwen2.5 và Xử lý Lệnh Giọng nói Thời Gian Thực',
      managerId: managerUser.id,
      createdById: huyDatUser.id,
    },
    create: {
      id: 'project-voice-ai-id',
      name: 'AI Voice Command & Biometrics Engine',
      description: 'Mô hình Cục bộ Ollama Qwen2.5 và Xử lý Lệnh Giọng nói Thời Gian Thực',
      createdById: huyDatUser.id,
      managerId: managerUser.id,
    },
  });

  // Project Memberships
  const allUsers = [huyDatUser, managerUser, employeeUser, empLanHuong, empDuyKhang, empThanhTung];
  for (const proj of [projectCore, projectUi, projectAI]) {
    for (const u of allUsers) {
      await prisma.projectMember.upsert({
        where: { projectId_userId: { projectId: proj.id, userId: u.id } },
        update: {},
        create: { projectId: proj.id, userId: u.id },
      });
    }
  }

  // 4. Tasks across all 6 status columns & multiple stages
  const today = new Date();
  const addDays = (d: number) => {
    const res = new Date(today);
    res.setDate(res.getDate() + d);
    return res;
  };

  const tasksData = [
    // Column: TODO
    {
      id: 'task-101',
      title: 'Thiết Kế Kiến Trúc Backend Module Profile & Authentication',
      description: 'Xây dựng DTO, Guard JWT, và Service xử lý API Profile cá nhân với phân quyền RBAC và mã hóa Refresh Token an toàn.',
      status: TaskStatus.TODO,
      priority: TaskPriority.IMPORTANT,
      progress: 0,
      projectId: projectCore.id,
      createdById: managerUser.id,
      assigneeId: empThanhTung.id,
      stageId: 'stage_1',
      dueDate: addDays(4),
    },
    {
      id: 'task-102',
      title: 'Tích Hợp Web Speech API & Bộ Lọc Nhiễu Âm Thanh Sóng Mic',
      description: 'Khởi tạo luồng ghi âm AudioContext, tính toán biên độ năng lượng RMS và chuyển đổi âm thanh trực tiếp sang Text.',
      status: TaskStatus.TODO,
      priority: TaskPriority.NORMAL,
      progress: 0,
      projectId: projectAI.id,
      createdById: huyDatUser.id,
      assigneeId: employeeUser.id,
      stageId: 'stage_1',
      dueDate: addDays(5),
    },

    // Column: IN_PROGRESS
    {
      id: 'task-103',
      title: 'Phát Triển Giao Diện Thẻ Kanban Glassmorphism & Sliding Indicator',
      description: 'Tối ưu hóa hiệu ứng chuyển động mượt mà với cubic-bezier, hào quang Glow Shadows và bảng màu đa sắc tương ứng từng Tab.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      progress: 60,
      projectId: projectUi.id,
      createdById: managerUser.id,
      assigneeId: empDuyKhang.id,
      stageId: 'stage_2',
      dueDate: addDays(2),
    },
    {
      id: 'task-104',
      title: 'Kết Nối NLP Parser với Ollama qwen2.5:3b & Regex Fallback',
      description: 'Xử lý các mẫu câu ra lệnh giọng nói: "Tạo task mới", "Chuyển sang trạng thái Done", "Tìm kiếm task khẩn cấp".',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.IMPORTANT,
      progress: 45,
      projectId: projectAI.id,
      createdById: huyDatUser.id,
      assigneeId: huyDatUser.id,
      stageId: 'stage_3',
      dueDate: addDays(3),
    },

    // Column: PAUSED
    {
      id: 'task-105',
      title: 'Tối Ưu Hóa Tải File Đính Kèm Dung Lượng Lớn Qua AWS S3 / MinIO',
      description: 'Tạm dừng chờ hoàn thiện cấu hình Docker Container MinIO trên máy chủ Staging.',
      status: TaskStatus.PAUSED,
      priority: TaskPriority.LOW,
      progress: 30,
      projectId: projectCore.id,
      createdById: managerUser.id,
      assigneeId: empThanhTung.id,
      stageId: 'stage_2',
      dueDate: addDays(7),
    },

    // Column: BLOCKED
    {
      id: 'task-106',
      title: 'Chứng Thực Google OAuth 2.0 & Đồng Bộ Lịch Google Calendar',
      description: 'Bị tắc nghẽn do đang chờ phê duyệt Client ID & Secret từ Google Cloud Console.',
      status: TaskStatus.BLOCKED,
      priority: TaskPriority.IMPORTANT,
      progress: 20,
      projectId: projectCore.id,
      createdById: managerUser.id,
      assigneeId: employeeUser.id,
      stageId: 'stage_1',
      dueDate: addDays(4),
    },

    // Column: IN_REVIEW (With Transfer Request Pending)
    {
      id: 'task-107',
      title: 'Kiểm Duyệt Giao Diện Bento Grid Đêm Vũ Trụ Trên Thiết Bị Di Động',
      description: 'Đảm bảo giao diện kính mờ hiển thị sắc nét trên các thiết bị iPhone & Android, hỗ trợ vuốt chạm touch kéo thả nhạy bén.',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.NORMAL,
      progress: 90,
      projectId: projectUi.id,
      createdById: huyDatUser.id,
      assigneeId: empDuyKhang.id,
      stageId: 'stage_4',
      dueDate: addDays(1),
    },

    // Column: DONE
    {
      id: 'task-108',
      title: 'Tích Hợp Điểm Danh Voice Biometrics 1-Click & Micro-Animations',
      description: 'Hoàn thiện luồng so khớp chất giọng Vector Voiceprint và ghi nhận điểm danh thời gian thực vào bảng attendance_logs.',
      status: TaskStatus.DONE,
      priority: TaskPriority.IMPORTANT,
      progress: 100,
      projectId: projectCore.id,
      createdById: huyDatUser.id,
      assigneeId: huyDatUser.id,
      stageId: 'stage_6',
      dueDate: addDays(1),
      completedAt: new Date(),
    },
    {
      id: 'task-109',
      title: 'Đo Lường & Tối Ưu Tốc Độ Biên Dịch Vite 8 HMR (Cold Start < 500ms)',
      description: 'Tách chunk tự động qua RollDown và nén gzip giảm 35% dung lượng bundle client.',
      status: TaskStatus.DONE,
      priority: TaskPriority.NORMAL,
      progress: 100,
      projectId: projectCore.id,
      createdById: managerUser.id,
      assigneeId: empLanHuong.id,
      stageId: 'stage_6',
      dueDate: addDays(2),
      completedAt: new Date(),
    },
  ];

  for (const t of tasksData) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        progress: t.progress,
        projectId: t.projectId,
        createdById: t.createdById,
        assigneeId: t.assigneeId,
        stageId: t.stageId,
        dueDate: t.dueDate,
        completedAt: t.completedAt || null,
      },
      create: {
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        progress: t.progress,
        projectId: t.projectId,
        createdById: t.createdById,
        assigneeId: t.assigneeId,
        stageId: t.stageId,
        dueDate: t.dueDate,
        completedAt: t.completedAt || null,
      },
    });
  }

  // 5. Subtasks (Chi tiết các công việc con)
  const subtasksData = [
    // Task 103 (Giao diện Kanban)
    { id: 'sub-103-1', taskId: 'task-103', title: 'Thiết kế hiệu ứng bóng mờ Solar Warping bằng Tailwind CSS', isDone: true, isUrgent: true, order: 0, assigneeId: empDuyKhang.id, estimatedDays: 1 },
    { id: 'sub-103-2', taskId: 'task-103', title: 'Xây dựng Sliding Pill Indicator với cubic-bezier đàn hồi', isDone: true, isUrgent: false, order: 1, assigneeId: employeeUser.id, estimatedDays: 1 },
    { id: 'sub-103-3', taskId: 'task-103', title: 'Tối ưu hóa kích thước Thẻ Kanban Card với Menu 3 chấm', isDone: true, isUrgent: false, order: 2, assigneeId: empDuyKhang.id, estimatedDays: 1 },
    { id: 'sub-103-4', taskId: 'task-103', title: 'Kiểm thử phản hồi Touch Drag & Drop trên Safari iOS', isDone: false, isUrgent: true, order: 3, assigneeId: empLanHuong.id, estimatedDays: 1 },

    // Task 104 (NLP Voice Parser)
    { id: 'sub-104-1', taskId: 'task-104', title: 'Định nghĩa Prompt System trích xuất JSON Intent cho Ollama', isDone: true, isUrgent: false, order: 0, assigneeId: huyDatUser.id, estimatedDays: 1 },
    { id: 'sub-104-2', taskId: 'task-104', title: 'Viết bộ Regex Fallback xử lý tức thì khi Offline (< 50ms)', isDone: true, isUrgent: false, order: 1, assigneeId: empThanhTung.id, estimatedDays: 1 },
    { id: 'sub-104-3', taskId: 'task-104', title: 'Kết nối Socket.IO truyền phát kết quả nhận diện giọng nói', isDone: false, isUrgent: true, order: 2, assigneeId: huyDatUser.id, estimatedDays: 2 },

    // Task 107 (Mobile Bento Grid)
    { id: 'sub-107-1', taskId: 'task-107', title: 'Kiểm tra độ tương phản Dark Mode đạt chuẩn WCAG AA', isDone: true, isUrgent: false, order: 0, assigneeId: empDuyKhang.id, estimatedDays: 1 },
    { id: 'sub-107-2', taskId: 'task-107', title: 'Chống vỡ layout và tràn văn bản (break-words) trên modal', isDone: true, isUrgent: false, order: 1, assigneeId: employeeUser.id, estimatedDays: 1 },
    { id: 'sub-107-3', taskId: 'task-107', title: 'Nghiệm thu chuyển giao sản phẩm cho Manager Minh Anh', isDone: false, isUrgent: true, order: 2, assigneeId: managerUser.id, estimatedDays: 1 },
  ];

  for (const st of subtasksData) {
    await prisma.subtask.upsert({
      where: { id: st.id },
      update: {
        title: st.title,
        isDone: st.isDone,
        isUrgent: st.isUrgent,
        order: st.order,
        assigneeId: st.assigneeId,
        estimatedDays: st.estimatedDays,
      },
      create: {
        id: st.id,
        taskId: st.taskId,
        title: st.title,
        isDone: st.isDone,
        isUrgent: st.isUrgent,
        order: st.order,
        assigneeId: st.assigneeId,
        estimatedDays: st.estimatedDays,
      },
    });
  }

  // 6. Comments (Lịch sử trao đổi thực tế)
  await prisma.comment.upsert({
    where: { id: 'comment-103-1' },
    update: {},
    create: {
      id: 'comment-103-1',
      taskId: 'task-103',
      userId: empDuyKhang.id,
      content: 'Đã hoàn thiện bộ màu Neon Gradient cho 4 chế độ xem: Vàng Hổ Phách, Tím Neon, Xanh Lục Bảo và Xanh Cyan!',
    },
  });

  await prisma.comment.upsert({
    where: { id: 'comment-103-2' },
    update: {},
    create: {
      id: 'comment-103-2',
      taskId: 'task-103',
      userId: managerUser.id,
      content: 'Tuyệt vời Duy Khang! Hãy kiểm tra kỹ hiệu năng trên màn hình 120Hz của điện thoại nhé.',
    },
  });

  // 7. Task Requests (Yêu cầu bàn giao nhiệm vụ)
  await prisma.taskRequest.upsert({
    where: { id: 'req-transfer-107' },
    update: {},
    create: {
      id: 'req-transfer-107',
      taskId: 'task-107',
      senderId: empDuyKhang.id,
      receiverId: managerUser.id,
      type: 'TRANSFER',
      status: 'PENDING',
      note: 'Kính gửi Manager Minh Anh, em đã hoàn tất 90% giao diện Bento Grid Mobile. Nhờ anh kiểm duyệt và tiếp nhận bàn giao giai đoạn!',
    },
  });

  // 8. Attachments (Tài liệu đính kèm & Figma Link)
  await prisma.attachment.upsert({
    where: { id: 'att-figma-103' },
    update: {},
    create: {
      id: 'att-figma-103',
      taskId: 'task-103',
      name: 'Figma Design System - Solaris Cosmic Glass v2.4',
      url: 'https://figma.com/@solaris/design-system-2026',
      type: 'link',
      size: 'Cloud Link',
    },
  });

  await prisma.attachment.upsert({
    where: { id: 'att-arch-104' },
    update: {},
    create: {
      id: 'att-arch-104',
      taskId: 'task-104',
      name: 'Solaris_AI_Voice_Architecture_Specification.pdf',
      url: 'https://cdn.solaris.internal/docs/ai_voice_spec_2026.pdf',
      type: 'file',
      size: '2.4 MB',
    },
  });

  // 9. Notifications (Thông báo hệ thống cho các nhân viên)
  const notifs = [
    {
      id: 'notif-1',
      userId: managerUser.id,
      actorId: empDuyKhang.id,
      title: 'Yêu cầu bàn giao nhiệm vụ mới',
      content: 'Duy Khang đã gửi yêu cầu bàn giao Task "Kiểm Duyệt Giao Diện Bento Grid Mobile".',
      type: NotificationType.TASK_TRANSFER_REQUEST,
      taskId: 'task-107',
      isRead: false,
    },
    {
      id: 'notif-2',
      userId: empLanHuong.id,
      actorId: huyDatUser.id,
      title: 'Nhiệm vụ mới được chỉ định',
      content: 'Bạn đã được gán vào Task "Đo Lường & Tối Ưu Tốc Độ Biên Dịch Vite 8".',
      type: NotificationType.TASK_ASSIGNED,
      taskId: 'task-109',
      isRead: false,
    },
  ];

  for (const n of notifs) {
    await prisma.notification.upsert({
      where: { id: n.id },
      update: {},
      create: n,
    });
  }

  // 10. Direct Messages & Call Logs (Giao tiếp & Gọi điện)
  await prisma.directMessage.upsert({
    where: { id: 'msg-1' },
    update: {},
    create: {
      id: 'msg-1',
      senderId: huyDatUser.id,
      receiverId: managerUser.id,
      content: 'Chào Minh Anh, tiến độ Sprint 42 đang chạy rất chuẩn chỉ, các module Voice AI đang được tích hợp đúng kế hoạch nhé!',
      isRead: true,
    },
  });

  await prisma.directMessage.upsert({
    where: { id: 'msg-2' },
    update: {},
    create: {
      id: 'msg-2',
      senderId: managerUser.id,
      receiverId: huyDatUser.id,
      content: 'Dạ anh Đạt, em vừa duyệt bàn giao giao diện Mobile từ Duy Khang, mọi thứ rất mượt mà anh nhé.',
      isRead: false,
    },
  });

  await prisma.callLog.upsert({
    where: { id: 'call-1' },
    update: {},
    create: {
      id: 'call-1',
      callerId: managerUser.id,
      receiverId: huyDatUser.id,
      type: CallType.AUDIO,
      status: CallStatus.COMPLETED,
      duration: 340,
    },
  });

  console.log('🎉 Comprehensive database seeding completed successfully with 100% full feature data coverage!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
