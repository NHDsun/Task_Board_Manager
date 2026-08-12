import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, Role, Profession, UserStatusSignal, TaskStatus, TaskPriority, AttendanceType, WorkMode, TaskRequestType, TaskRequestStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:your_password_here@localhost:5432/task_management_db?schema=public';
const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Departments
  const deptProduct = await prisma.department.upsert({
    where: { code: 'PRODUCT' },
    update: { name: 'Product', description: 'Phòng Quản lý & Phát triển Sản phẩm' },
    create: {
      name: 'Product',
      code: 'PRODUCT',
      description: 'Phòng Quản lý & Phát triển Sản phẩm',
    },
  });

  const deptClient = await prisma.department.upsert({
    where: { code: 'CLIENT' },
    update: { name: 'Client', description: 'Phòng Quản lý Khách hàng & Dự án Client' },
    create: {
      name: 'Client',
      code: 'CLIENT',
      description: 'Phòng Quản lý Khách hàng & Dự án Client',
    },
  });

  console.log('✅ Created Departments:', deptProduct.name, deptClient.name);

  // 2. Create Users
  const defaultAdminPassword = await bcrypt.hash('password123', 10);
  const huyDatPassword = await bcrypt.hash('11032005', 10);

  const huyDatUser = await prisma.user.upsert({
    where: { email: 'huydatne@gmail.com' },
    update: {
      id: 'admin-huydat-id',
      password: huyDatPassword,
      role: Role.ADMIN,
      profession: Profession.DEV,
      jobTitle: 'System Architect & Lead Admin',
      avatar: '',
      coverImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
      phone: '+84 988 123 456',
      bio: 'Chuyên gia thiết kế kiến trúc hệ thống Solaris Task Board & AI Agent System.',
      statusSignal: UserStatusSignal.ONLINE,
      customStatus: '🟢 Đang làm việc trên Bảng Kanban Solaris...',
    },
    create: {
      id: 'admin-huydat-id',
      email: 'huydatne@gmail.com',
      password: huyDatPassword,
      fullName: 'Huy Dat (Admin)',
      role: Role.ADMIN,
      profession: Profession.DEV,
      jobTitle: 'System Architect & Lead Admin',
      avatar: '',
      coverImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
      phone: '+84 988 123 456',
      bio: 'Chuyên gia thiết kế kiến trúc hệ thống Solaris Task Board & AI Agent System.',
      statusSignal: UserStatusSignal.ONLINE,
      customStatus: '🟢 Đang làm việc trên Bảng Kanban Solaris...',
      departmentId: deptProduct.id,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@taskboard.com' },
    update: {
      id: 'manager-minhanh-id',
      password: defaultAdminPassword,
      role: Role.MANAGER,
      profession: Profession.PRODUCT_OWNER,
      jobTitle: 'Project Manager & Scrum Master',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
    },
    create: {
      id: 'manager-minhanh-id',
      email: 'manager@taskboard.com',
      password: defaultAdminPassword,
      fullName: 'Minh Anh (Manager)',
      role: Role.MANAGER,
      profession: Profession.PRODUCT_OWNER,
      jobTitle: 'Project Manager & Scrum Master',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
      departmentId: deptProduct.id,
    },
  });

  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@taskboard.com' },
    update: {
      id: 'employee-hoangnam-id',
      password: defaultAdminPassword,
      role: Role.EMPLOYEE,
      profession: Profession.DEV,
      jobTitle: 'Frontend & Fullstack Developer',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
    },
    create: {
      id: 'employee-hoangnam-id',
      email: 'employee@taskboard.com',
      password: defaultAdminPassword,
      fullName: 'Hoang Nam (Developer)',
      role: Role.EMPLOYEE,
      profession: Profession.DEV,
      jobTitle: 'Frontend & Fullstack Developer',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
      departmentId: deptClient.id,
    },
  });

  console.log('✅ Created Users:', huyDatUser.email, managerUser.email, employeeUser.email);

  // 3. Create Projects
  const projectCore = await prisma.project.upsert({
    where: { id: 'project-solaris-core-id' },
    update: { name: 'Solaris Task Board Core', description: 'Hệ thống Quản Lý Task Thông Minh Đêm Vũ Trụ' },
    create: {
      id: 'project-solaris-core-id',
      name: 'Solaris Task Board Core',
      description: 'Hệ thống Quản Lý Task Thông Minh Đêm Vũ Trụ',
      createdById: huyDatUser.id,
    },
  });

  const projectUi = await prisma.project.upsert({
    where: { id: 'project-solaris-ui-id' },
    update: { name: 'Solaris UI Redesign', description: 'Nâng cấp Giao Diện UI UX Pro Max Bento Grid' },
    create: {
      id: 'project-solaris-ui-id',
      name: 'Solaris UI Redesign',
      description: 'Nâng cấp Giao Diện UI UX Pro Max Bento Grid',
      createdById: managerUser.id,
    },
  });

  console.log('✅ Created Projects:', projectCore.name, projectUi.name);

  // 4. Create Project Memberships
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: projectCore.id, userId: huyDatUser.id } },
    update: {},
    create: { projectId: projectCore.id, userId: huyDatUser.id },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: projectCore.id, userId: managerUser.id } },
    update: {},
    create: { projectId: projectCore.id, userId: managerUser.id },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: projectCore.id, userId: employeeUser.id } },
    update: {},
    create: { projectId: projectCore.id, userId: employeeUser.id },
  });

  // 5. Create Tasks in Database
  const task1 = await prisma.task.upsert({
    where: { id: 'task-101' },
    update: {
      title: 'Thiết Kế Kiến Trúc Backend Module Profile & Authentication',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      progress: 65,
    },
    create: {
      id: 'task-101',
      title: 'Thiết Kế Kiến Trúc Backend Module Profile & Authentication',
      description: 'Xây dựng DTO, Guard JWT, và Service xử lý API Profile cá nhân',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      progress: 65,
      projectId: projectCore.id,
      createdById: huyDatUser.id,
      assigneeId: huyDatUser.id,
      dueDate: new Date('2026-08-15'),
    },
  });

  const task2 = await prisma.task.upsert({
    where: { id: 'task-102' },
    update: {
      title: 'Kiểm Thử Hiệu Năng Tốc Độ Biên Dịch Vite 8 & HMR',
      status: TaskStatus.TODO,
      priority: TaskPriority.IMPORTANT,
      progress: 0,
    },
    create: {
      id: 'task-102',
      title: 'Kiểm Thử Hiệu Năng Tốc Độ Biên Dịch Vite 8 & HMR',
      description: 'Đo lường thời gian build sản phẩm production trên React 19',
      status: TaskStatus.TODO,
      priority: TaskPriority.IMPORTANT,
      progress: 0,
      projectId: projectCore.id,
      createdById: managerUser.id,
      assigneeId: employeeUser.id,
      dueDate: new Date('2026-08-18'),
    },
  });

  const task3 = await prisma.task.upsert({
    where: { id: 'task-103' },
    update: {
      title: 'Kiểm Duyệt Giao Diện Bento Grid Đêm Vũ Trụ Trên Mobile',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.NORMAL,
      progress: 90,
    },
    create: {
      id: 'task-103',
      title: 'Kiểm Duyệt Giao Diện Bento Grid Đêm Vũ Trụ Trên Mobile',
      description: 'Đảm bảo giao diện kính mờ hiển thị sắc nét trên các thiết bị',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.NORMAL,
      progress: 90,
      projectId: projectUi.id,
      createdById: huyDatUser.id,
      assigneeId: managerUser.id,
      dueDate: new Date('2026-08-14'),
    },
  });

  const task4 = await prisma.task.upsert({
    where: { id: 'task-104' },
    update: {
      title: 'Tích Hợp Chấm Công Voice 1-Click & Micro-Animations',
      status: TaskStatus.DONE,
      priority: TaskPriority.IMPORTANT,
      progress: 100,
    },
    create: {
      id: 'task-104',
      title: 'Tích Hợp Chấm Công Voice 1-Click & Micro-Animations',
      description: 'Hoàn thiện luồng ghi nhận điểm danh giọng nói thời gian thực',
      status: TaskStatus.DONE,
      priority: TaskPriority.IMPORTANT,
      progress: 100,
      projectId: projectCore.id,
      createdById: huyDatUser.id,
      assigneeId: huyDatUser.id,
      dueDate: new Date('2026-08-10'),
    },
  });

  console.log('✅ Created Seed Tasks:', task1.title, task2.title, task3.title, task4.title);

  // 6. Create Seed Attendance Logs
  await prisma.attendanceLog.create({
    data: {
      userId: huyDatUser.id,
      type: AttendanceType.VOICE,
      workMode: WorkMode.OFFICE,
      note: 'Điểm danh giọng nói thành công lúc 08:30 AM',
    },
  });

  // 7. Create Seed Task Request
  await prisma.taskRequest.create({
    data: {
      taskId: task2.id,
      senderId: employeeUser.id,
      receiverId: managerUser.id,
      type: TaskRequestType.TRANSFER,
      status: TaskRequestStatus.PENDING,
      note: 'Yêu cầu bàn giao Task do cần tập trung cho module kiểm thử HMR',
    },
  });

  console.log('🎉 Database Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
