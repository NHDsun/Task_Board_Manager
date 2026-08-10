import { PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Tạo 2 Phòng ban: Product và Client theo yêu cầu
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

  // 2. Tạo sẵn 1 tài khoản Admin mặc định
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@taskboard.com' },
    update: {},
    create: {
      email: 'admin@taskboard.com',
      password: 'password123',
      fullName: 'System Administrator',
      role: Role.ADMIN,
      departmentId: deptProduct.id,
    },
  });

  console.log('✅ Created Admin User:', adminUser.email);

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
