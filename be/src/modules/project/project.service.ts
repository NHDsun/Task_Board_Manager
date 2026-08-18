import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createProjectDto: CreateProjectDto, user?: any) {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id' || userId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({ where: { email: 'huydatne@gmail.com' } });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    const currentUser = user || (await this.prisma.user.findUnique({ where: { id: effectiveUserId } }));
    if (!currentUser || currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Chỉ Quản trị viên (Admin) mới có quyền tạo dự án mới!');
    }

    // 🔒 [LC-48] CHẶN TRÙNG TÊN DỰ ÁN ĐANG HOẠT ĐỘNG
    const existingProject = await this.prisma.project.findFirst({
      where: { name: createProjectDto.name.trim(), isCompleted: false },
    });
    if (existingProject) {
      throw new BadRequestException(`Dự án đang hoạt động mang tên "${createProjectDto.name.trim()}" đã tồn tại trong hệ thống!`);
    }

    // 🔒 [LC-43] KIỂM TRA QUẢN LÝ ĐƯỢC CHỈ ĐỊNH CÓ TỒN TẠI KHÔNG
    if (createProjectDto.managerId) {
      const managerUser = await this.prisma.user.findUnique({ where: { id: createProjectDto.managerId } });
      if (!managerUser) {
        throw new BadRequestException('Quản lý được chỉ định cho dự án không tồn tại trong hệ thống!');
      }
    }

    const memberIds = Array.from(
      new Set([
        effectiveUserId,
        ...(createProjectDto.managerId ? [createProjectDto.managerId] : []),
        ...(createProjectDto.memberIds || []),
      ])
    );

    return this.prisma.project.create({
      data: {
        name: createProjectDto.name.trim(),
        description: createProjectDto.description,
        createdById: effectiveUserId,
        managerId: createProjectDto.managerId || effectiveUserId,
        stagesJson: createProjectDto.stagesJson || null,
        members: {
          create: memberIds.map((mId) => ({ userId: mId })),
        },
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        manager: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        members: {
          include: {
            user: { select: { id: true, fullName: true, email: true, avatar: true } },
          },
        },
      },
    });
  }

  async findAll(userId: string) {
    let effectiveUserId = userId;
    if (userId === 'admin-huydat-id' || userId === 'admin-id') {
      const realAdmin = await this.prisma.user.findUnique({ where: { email: 'huydatne@gmail.com' } });
      if (realAdmin) effectiveUserId = realAdmin.id;
    }

    const currentUser = await this.prisma.user.findUnique({ where: { id: effectiveUserId } });
    const isAdmin = currentUser?.role === 'ADMIN';

    return this.prisma.project.findMany({
      where: isAdmin
        ? {}
        : {
            OR: [
              { createdById: effectiveUserId },
              { managerId: effectiveUserId },
              { members: { some: { userId: effectiveUserId } } },
            ],
          },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        manager: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        _count: {
          select: {
            members: true,
            tasks: { where: { isDeleted: false } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        manager: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        members: {
          include: {
            user: { select: { id: true, fullName: true, email: true, avatar: true, profession: true, jobTitle: true } },
          },
        },
        tasks: {
          where: { isDeleted: false }, // 🔒 [LC-42] LỌC BỎ TASK TRONG THÙNG RÁC
          include: {
            assignee: { select: { id: true, fullName: true, email: true, avatar: true } },
            tags: { include: { tag: true } },
            _count: { select: { comments: true, subtasks: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user?: any) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    // 🔒 [LC-41] PHÂN QUYỀN CẬP NHẬT DỰ ÁN (CHỈ ADMIN HOẶC MANAGER DỰ ÁN)
    if (user) {
      const isManagerOrAdmin =
        user.role === 'ADMIN' ||
        user.globalRole === 'ADMIN' ||
        user.role === 'MANAGER' ||
        user.globalRole === 'MANAGER' ||
        project.managerId === user.id ||
        project.createdById === user.id;

      if (!isManagerOrAdmin) {
        throw new ForbiddenException('Chỉ Quản trị viên (Admin) hoặc Quản lý dự án mới có quyền chỉnh sửa thông tin dự án!');
      }
    }

    // 🔒 [LC-43] KIỂM TRA QUẢN LÝ MỚI NẾU CÓ CHỈ ĐỊNH
    if (updateProjectDto.managerId) {
      const managerUser = await this.prisma.user.findUnique({ where: { id: updateProjectDto.managerId } });
      if (!managerUser) {
        throw new BadRequestException('Quản lý được chỉ định cho dự án không tồn tại trong hệ thống!');
      }
    }

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.project.delete({
      where: { id },
    });
  }

  // 👥 Lấy danh sách thành viên dự án kèm số lượng task đang phụ trách
  async getMembers(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        manager: { select: { id: true, fullName: true, email: true, avatar: true, profession: true, role: true } },
        createdBy: { select: { id: true, fullName: true, email: true, avatar: true, profession: true, role: true } },
        members: {
          include: {
            user: { select: { id: true, fullName: true, email: true, avatar: true, profession: true, role: true, jobTitle: true } },
          },
        },
      },
    });
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    // Lấy số lượng task đang phụ trách của từng member trong dự án
    const taskCounts = await this.prisma.task.groupBy({
      by: ['assigneeId'],
      where: { projectId, isDeleted: false },
      _count: { id: true },
    });
    const taskCountMap: Record<string, number> = {};
    taskCounts.forEach((tc) => {
      if (tc.assigneeId) taskCountMap[tc.assigneeId] = tc._count.id;
    });

    const list = project.members.map((m) => ({
      ...m.user,
      isManager: m.userId === project.managerId,
      isCreator: m.userId === project.createdById,
      activeTasksCount: taskCountMap[m.userId] || 0,
      joinedAt: m.joinedAt,
    }));

    return {
      projectId: project.id,
      projectName: project.name,
      managerId: project.managerId,
      manager: project.manager,
      members: list,
    };
  }

  // ➕ Thêm thành viên vào dự án
  async addMember(projectId: string, userIdToAdd: string, user: any) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, managerId: true, createdById: true },
    });
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    const isAdminOrManager = Boolean(
      user &&
        (user.role === 'ADMIN' ||
          user.role === 'MANAGER' ||
          user.globalRole === 'ADMIN' ||
          user.globalRole === 'MANAGER' ||
          project.managerId === user.id ||
          project.createdById === user.id),
    );
    if (!isAdminOrManager) {
      throw new ForbiddenException('Chỉ Quản lý hoặc Admin mới có quyền thêm thành viên vào dự án');
    }

    const existing = await this.prisma.projectMember.findFirst({
      where: { projectId, userId: userIdToAdd },
    });
    if (existing) {
      throw new BadRequestException('Nhân sự này đã là thành viên của dự án');
    }

    return this.prisma.projectMember.create({
      data: { projectId, userId: userIdToAdd },
      include: {
        user: { select: { id: true, fullName: true, email: true, avatar: true, profession: true, jobTitle: true } },
      },
    });
  }

  // 🚪 Xóa thành viên khỏi dự án -> Tự động chuyển toàn bộ Task của thành viên đó về cho Manager của Dự án
  async removeMember(projectId: string, userIdToRemove: string, user: any) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, managerId: true, createdById: true },
    });
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    const isAdminOrManager = Boolean(
      user &&
        (user.role === 'ADMIN' ||
          user.role === 'MANAGER' ||
          user.globalRole === 'ADMIN' ||
          user.globalRole === 'MANAGER' ||
          project.managerId === user.id ||
          project.createdById === user.id),
    );
    if (!isAdminOrManager) {
      throw new ForbiddenException('Chỉ Quản lý hoặc Admin mới có quyền xóa thành viên khỏi dự án');
    }

    if (userIdToRemove === project.managerId) {
      throw new BadRequestException('Không thể xóa Quản lý chính (Project Manager) ra khỏi dự án!');
    }

    // Manager nhận lại các task của thành viên bị xóa
    const targetManagerId = project.managerId || project.createdById || user.id;

    // 1. Chuyển giao toàn bộ các Task đang gán cho thành viên đó về cho Manager của dự án
    await this.prisma.task.updateMany({
      where: { projectId, assigneeId: userIdToRemove },
      data: { assigneeId: targetManagerId },
    });

    // 2. Chuyển giao toàn bộ các Subtask đang gán riêng cho thành viên đó về cho Manager
    await this.prisma.subtask.updateMany({
      where: { task: { projectId }, assigneeId: userIdToRemove },
      data: { assigneeId: targetManagerId },
    });

    // 3. 🔒 [LC-33] HỦY TOÀN BỘ YÊU CẦU DUYỆT / CHUYỂN GIAO ĐANG TREO CỦA THÀNH VIÊN BỊ XÓA
    await this.prisma.taskRequest.updateMany({
      where: {
        task: { projectId },
        status: 'PENDING',
        OR: [{ senderId: userIdToRemove }, { receiverId: userIdToRemove }],
      },
      data: {
        status: 'CANCELLED',
        responseNote: 'Thành viên liên quan đã bị Quản lý xóa khỏi dự án.',
      },
    });

    // 4. Xóa quan hệ thành viên khỏi bảng project_members
    await this.prisma.projectMember.deleteMany({
      where: { projectId, userId: userIdToRemove },
    });

    return { success: true, reassignedToManagerId: targetManagerId };
  }
}
