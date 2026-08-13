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
      password: defaultPassword,
      role: Role.MANAGER,
      profession: Profession.PRODUCT_OWNER,
      jobTitle: 'Project Manager & Scrum Master',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
    },
    create: {
      id: 'manager-minhanh-id',
      email: 'manager@taskboard.com',
      password: defaultPassword,
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
      password: defaultPassword,
      role: Role.EMPLOYEE,
      profession: Profession.DEV,
      jobTitle: 'Frontend & Fullstack Developer',
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
      jobTitle: 'Frontend & Fullstack Developer',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
      departmentId: deptClient.id,
    },
  });

  // ➕ NEW EMPLOYEES ADDED
  const empLanHuong = await prisma.user.upsert({
    where: { email: 'lanhuong@taskboard.com' },
    update: {
      password: defaultPassword,
      role: Role.EMPLOYEE,
      profession: Profession.TESTER,
      jobTitle: 'Lead QA & Automation Tester',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
    },
    create: {
      email: 'lanhuong@taskboard.com',
      password: defaultPassword,
      fullName: 'Lan Huong (QA Tester)',
      role: Role.EMPLOYEE,
      profession: Profession.TESTER,
      jobTitle: 'Lead QA & Automation Tester',
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
      jobTitle: 'Senior UI/UX Designer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.BUSY,
    },
    create: {
      email: 'duykhang@taskboard.com',
      password: defaultPassword,
      fullName: 'Duy Khang (UI/UX Designer)',
      role: Role.EMPLOYEE,
      profession: Profession.DESIGNER,
      jobTitle: 'Senior UI/UX Designer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.BUSY,
      departmentId: deptClient.id,
    },
  });

  const empThanhTung = await prisma.user.upsert({
    where: { email: 'thanhtung@taskboard.com' },
    update: {
      password: defaultPassword,
      role: Role.EMPLOYEE,
      profession: Profession.DEV,
      jobTitle: 'Backend Specialist (NestJS & Microservices)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
    },
    create: {
      email: 'thanhtung@taskboard.com',
      password: defaultPassword,
      fullName: 'Thanh Tung (Backend Dev)',
      role: Role.EMPLOYEE,
      profession: Profession.DEV,
      jobTitle: 'Backend Specialist (NestJS & Microservices)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      statusSignal: UserStatusSignal.ONLINE,
      departmentId: deptProduct.id,
    },
  });

  console.log('✅ Created Users:', huyDatUser.email, managerUser.email, employeeUser.email, empLanHuong.email, empDuyKhang.email, empThanhTung.email);

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
  const memberUsers = [huyDatUser, managerUser, employeeUser, empLanHuong, empDuyKhang, empThanhTung];
  for (const u of memberUsers) {
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: projectCore.id, userId: u.id } },
      update: {},
      create: { projectId: projectCore.id, userId: u.id },
    });
  }

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
      assigneeId: empLanHuong.id,
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
      assigneeId: empDuyKhang.id,
      dueDate: new Date('2026-08-14'),
    },
  });

  // Seed PENDING TaskRequest for task-103 (Duy Khang -> Minh Anh)
  await prisma.taskRequest.upsert({
    where: { id: 'req-seed-103' },
    update: {
      status: 'PENDING',
    },
    create: {
      id: 'req-seed-103',
      taskId: task3.id,
      senderId: empDuyKhang.id,
      receiverId: managerUser.id,
      type: 'TRANSFER',
      status: 'PENDING',
      note: 'Đã hoàn thiện 90% giao diện Bento Grid Đêm Vũ Trụ trên Mobile. Kính gửi Manager Minh Anh kiểm duyệt bài và nhận bàn giao.',
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
      assigneeId: empThanhTung.id,
      dueDate: new Date('2026-08-10'),
    },
  });

  console.log('✅ Created Seed Tasks:', task1.title, task2.title, task3.title, task4.title);
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
