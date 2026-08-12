import { PrismaClient, Role, Profession, UserStatusSignal } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

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

  const defaultAdminPassword = await bcrypt.hash('password123', 10);
  const huyDatPassword = await bcrypt.hash('11032005', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@taskboard.com' },
    update: {
      password: defaultAdminPassword,
      profession: Profession.PRODUCT_OWNER,
      jobTitle: 'Chief Product Officer',
      statusSignal: UserStatusSignal.ONLINE,
    },
    create: {
      email: 'admin@taskboard.com',
      password: defaultAdminPassword,
      fullName: 'System Administrator',
      role: Role.ADMIN,
      profession: Profession.PRODUCT_OWNER,
      jobTitle: 'Chief Product Officer',
      statusSignal: UserStatusSignal.ONLINE,
      departmentId: deptProduct.id,
    },
  });

  const huyDatUser = await prisma.user.upsert({
    where: { email: 'huydatne@gmail.com' },
    update: {
      password: huyDatPassword,
      role: Role.ADMIN,
      profession: Profession.DEV,
      jobTitle: 'System Architect & Lead Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      coverImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
      phone: '+84 988 123 456',
      bio: 'Chuyên gia thiết kế kiến trúc hệ thống Solaris Task Board & AI Agent System.',
      statusSignal: UserStatusSignal.ONLINE,
      customStatus: '🟢 Đang làm việc trên Bảng Kanban Solaris...',
    },
    create: {
      email: 'huydatne@gmail.com',
      password: huyDatPassword,
      fullName: 'Huy Dat (Admin)',
      role: Role.ADMIN,
      profession: Profession.DEV,
      jobTitle: 'System Architect & Lead Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      coverImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
      phone: '+84 988 123 456',
      bio: 'Chuyên gia thiết kế kiến trúc hệ thống Solaris Task Board & AI Agent System.',
      statusSignal: UserStatusSignal.ONLINE,
      customStatus: '🟢 Đang làm việc trên Bảng Kanban Solaris...',
      departmentId: deptProduct.id,
    },
  });

  // 1. MANAGER Account
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@taskboard.com' },
    update: {
      password: defaultAdminPassword,
      role: Role.MANAGER,
      profession: Profession.PRODUCT_OWNER,
      jobTitle: 'Project Manager & Scrum Master',
      statusSignal: UserStatusSignal.ONLINE,
    },
    create: {
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

  // 2. EMPLOYEE Account
  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@taskboard.com' },
    update: {
      password: defaultAdminPassword,
      role: Role.EMPLOYEE,
      profession: Profession.DEV,
      jobTitle: 'Frontend & Fullstack Developer',
      statusSignal: UserStatusSignal.ONLINE,
    },
    create: {
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

  console.log('✅ Created Admin User 1:', adminUser.email);
  console.log('✅ Created Admin User 2:', huyDatUser.email);
  console.log('✅ Created Manager User:', managerUser.email);
  console.log('✅ Created Employee User:', employeeUser.email);

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
