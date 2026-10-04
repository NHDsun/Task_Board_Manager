import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthUserPayload } from '../../common/interfaces/auth-user.interface';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway
  ) {}

  async create(userId: string, createProjectDto: CreateProjectDto, user?: AuthUserPayload) {
    const currentUser = user || (await this.prisma.user.findUnique({ where: { id: userId } }));
    if (!currentUser || currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Chỉ Quản trị viên (Admin) mới có quyền tạo dự án mới!');
    }

    // 🔒 [LC-99] CHẶN TRÙNG TÊN DỰ ÁN TOÀN DIỆN (CASE-INSENSITIVE & EXCLUDING DELETED)
    const trimmedName = createProjectDto.name.trim();
    const existingProject = await this.prisma.project.findFirst({
      where: {
        isDeleted: false,
        name: { equals: trimmedName, mode: 'insensitive' },
      },
    });
    if (existingProject) {
      throw new BadRequestException(
        `Dự án mang tên "${trimmedName}" đã tồn tại trong hệ thống! Vui lòng đặt một tên khác để tránh nhầm lẫn.`
      );
    }

    // 🔒 [LC-101] TỰ ĐỘNG CẤP QUYỀN VÀ BẢO ĐẢM QUẢN LÝ DỰ ÁN CÓ ROLE MANAGER
    const assignedManagerId = createProjectDto.managerId || userId;
    if (assignedManagerId) {
      const managerUser = await this.prisma.user.findUnique({
        where: { id: assignedManagerId },
      });
      if (!managerUser) {
        throw new BadRequestException('Quản lý được chỉ định cho dự án không tồn tại trong hệ thống!');
      }
      if (managerUser.role === 'EMPLOYEE') {
        await this.prisma.user.update({
          where: { id: assignedManagerId },
          data: { role: 'MANAGER' },
        });
      }
    }

    const memberIds = Array.from(
      new Set([
        userId,
        ...(createProjectDto.managerId ? [createProjectDto.managerId] : []),
        ...(createProjectDto.memberIds || []),
      ])
    );

    return this.prisma.project.create({
      data: {
        name: createProjectDto.name.trim(),
        description: createProjectDto.description,
        createdById: userId,
        managerId: createProjectDto.managerId || userId,
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
            user: {
              select: { id: true, fullName: true, email: true, avatar: true },
            },
          },
        },
      },
    });
  }

  async findAll(userId: string) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const isAdmin = currentUser?.role === 'ADMIN';

    return this.prisma.project.findMany({
      where: {
        isDeleted: false,
        ...(isAdmin
          ? {}
          : {
              OR: [{ createdById: userId }, { managerId: userId }, { members: { some: { userId: userId } } }],
            }),
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
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true,
                profession: true,
                jobTitle: true,
              },
            },
          },
        },
        tasks: {
          where: { isDeleted: false }, // 🔒 [LC-42] LỌC BỎ TASK TRONG THÙNG RÁC
          include: {
            assignee: {
              select: { id: true, fullName: true, email: true, avatar: true },
            },
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
        throw new ForbiddenException(
          'Chỉ Quản trị viên (Admin) hoặc Quản lý dự án mới có quyền chỉnh sửa thông tin dự án!'
        );
      }

      // 🔒 [LC-171] CHỈ DUY NHẤT ADMIN MỚI CÓ QUYỀN XÁC NHẬN NGHIỆM THU HOÀN THÀNH HOẶC MỞ LẠI DỰ ÁN
      if (updateProjectDto.isCompleted !== undefined) {
        const isAdmin = user.role === 'ADMIN' || user.globalRole === 'ADMIN';
        if (!isAdmin) {
          throw new ForbiddenException(
            'Chỉ Quản trị viên (Admin) mới có quyền xác nhận hoàn thành hoặc mở lại dự án!'
          );
        }
      }
    }

    // 🔒 [LC-101] TỰ ĐỘNG CẤP QUYỀN VÀ BẢO ĐẢM QUẢN LÝ MỚI CÓ ROLE MANAGER
    if (updateProjectDto.managerId) {
      const managerUser = await this.prisma.user.findUnique({
        where: { id: updateProjectDto.managerId },
      });
      if (!managerUser) {
        throw new BadRequestException('Quản lý được chỉ định cho dự án không tồn tại trong hệ thống!');
      }
      if (managerUser.role === 'EMPLOYEE') {
        await this.prisma.user.update({
          where: { id: updateProjectDto.managerId },
          data: { role: 'MANAGER' },
        });
      }
      // Đảm bảo Quản lý mới có trong danh sách thành viên dự án
      const isMember = await this.prisma.projectMember.findFirst({
        where: { projectId: id, userId: updateProjectDto.managerId },
      });
      if (!isMember) {
        await this.prisma.projectMember.create({
          data: { projectId: id, userId: updateProjectDto.managerId },
        });
      }
    }

    // 🔒 [LC-99] CHẶN TRÙNG TÊN DỰ ÁN KHI CẬP NHẬT / ĐỔI TÊN
    if (updateProjectDto.name) {
      const trimmedName = updateProjectDto.name.trim();
      const duplicateProject = await this.prisma.project.findFirst({
        where: {
          id: { not: id },
          isDeleted: false,
          name: { equals: trimmedName, mode: 'insensitive' },
        },
      });
      if (duplicateProject) {
        throw new BadRequestException(
          `Tên dự án "${trimmedName}" đã tồn tại trên một dự án khác trong hệ thống! Vui lòng chọn tên khác.`
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.project.update({
        where: { id },
        data: updateProjectDto,
      });

      // 🔒 [LC-80] TỰ ĐỘNG HỦY TOÀN BỘ YÊU CẦU CHUYỂN GIAO / DUYỆT ĐANG TREO KHI ĐÓNG DỰ ÁN
      if (updateProjectDto.isCompleted === true) {
        const projectTasks = await tx.task.findMany({
          where: { projectId: id },
          select: { id: true },
        });
        const taskIds = projectTasks.map((t) => t.id);
        if (taskIds.length > 0) {
          await tx.taskRequest.updateMany({
            where: {
              taskId: { in: taskIds },
              status: 'PENDING',
            },
            data: {
              status: 'CANCELLED',
              responseNote: 'Dự án đã hoàn thành/nghiệm thu và đóng hồ sơ.',
            },
          });
        }
      }

      return updated;
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
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
            profession: true,
            jobTitle: true,
            role: true,
          },
        },
        manager: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
            profession: true,
            jobTitle: true,
            role: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true,
                profession: true,
                jobTitle: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }

    const membersMap = new Map<string, any>();

    if (project.createdBy) {
      membersMap.set(project.createdBy.id, {
        ...project.createdBy,
        roleInProject: 'OWNER',
        roleLabel: 'Chủ Dự Án',
      });
    }

    if (project.manager) {
      membersMap.set(project.manager.id, {
        ...project.manager,
        roleInProject: 'MANAGER',
        roleLabel: 'Quản Lý Dự Án',
      });
    }

    project.members.forEach((m) => {
      if (m.user && !membersMap.has(m.user.id)) {
        membersMap.set(m.user.id, {
          ...m.user,
          roleInProject: 'MEMBER',
          roleLabel: 'Thành Viên',
          joinedAt: m.joinedAt,
        });
      }
    });

    return {
      projectId: project.id,
      projectName: project.name,
      members: Array.from(membersMap.values()),
    };
  }

  // ➕ Thêm thành viên vào dự án
  async addMember(projectId: string, userIdToAdd: string, user: AuthUserPayload) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, managerId: true, createdById: true, isCompleted: true },
    });
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }
    if (project.isCompleted) {
      throw new BadRequestException('Dự án này đã hoàn thành/nghiệm thu và đã đóng. Không thể thêm thành viên mới!');
    }

    const isAdminOrManager = Boolean(
      user &&
      (user.role === 'ADMIN' ||
        user.role === 'MANAGER' ||
        project.managerId === user.id ||
        project.createdById === user.id)
    );
    if (!isAdminOrManager) {
      throw new ForbiddenException('Chỉ Quản lý hoặc Admin mới có quyền thêm thành viên vào dự án');
    }

    const userToAdd = await this.prisma.user.findUnique({
      where: { id: userIdToAdd },
      select: { id: true, isActive: true },
    });
    if (!userToAdd) {
      throw new NotFoundException('Nhân sự không tồn tại trong hệ thống');
    }
    if (!userToAdd.isActive) {
      throw new BadRequestException('Không thể thêm nhân sự đang bị khóa tài khoản (Inactive) vào dự án!');
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
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
            profession: true,
            jobTitle: true,
          },
        },
      },
    });
  }

  // 🚪 Xóa thành viên khỏi dự án -> Tự động chuyển toàn bộ Task của thành viên đó về cho Manager của Dự án
  async removeMember(projectId: string, userIdToRemove: string, user: AuthUserPayload) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, managerId: true, createdById: true, isCompleted: true },
    });
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại');
    }
    if (project.isCompleted) {
      throw new BadRequestException('Dự án này đã hoàn thành/nghiệm thu và đã đóng. Không thể thay đổi thành viên!');
    }

    const isAdminOrManager = Boolean(
      user &&
      (user.role === 'ADMIN' ||
        user.role === 'MANAGER' ||
        project.managerId === user.id ||
        project.createdById === user.id)
    );
    if (!isAdminOrManager) {
      throw new ForbiddenException('Chỉ Quản lý hoặc Admin mới có quyền xóa thành viên khỏi dự án');
    }

    // Không cho phép xóa Chủ dự án hoặc Manager chính của dự án qua endpoint này
    if (userIdToRemove === project.createdById) {
      throw new BadRequestException('Không thể xóa Chủ dự án (Owner) khỏi dự án');
    }
    if (userIdToRemove === project.managerId) {
      throw new BadRequestException('Không thể xóa Quản lý chính (Manager) khỏi dự án. Vui lòng đổi Manager trước.');
    }

    const fallbackAssigneeId = project.managerId || project.createdById;

    await this.prisma.$transaction(async (tx) => {
      // 1. Xóa bản ghi thành viên
      await tx.projectMember.deleteMany({
        where: { projectId, userId: userIdToRemove },
      });

      // 2. Tự động chuyển giao toàn bộ Task đang gán cho thành viên này về cho Manager / Creator dự án
      await tx.task.updateMany({
        where: {
          projectId,
          assigneeId: userIdToRemove,
          isDeleted: false,
          isArchived: false,
        },
        data: {
          assigneeId: fallbackAssigneeId,
        },
      });

      // 3. Chuyển giao các Subtask con đang gán cho thành viên này về cho Manager
      await tx.subtask.updateMany({
        where: {
          task: { projectId },
          assigneeId: userIdToRemove,
        },
        data: {
          assigneeId: fallbackAssigneeId,
        },
      });

      // 4. 🔒 [LC-115] Tự động hủy toàn bộ TaskRequest đang PENDING liên quan đến thành viên bị xóa
      await tx.taskRequest.updateMany({
        where: {
          task: { projectId },
          status: 'PENDING',
          OR: [
            { senderId: userIdToRemove },
            { receiverId: userIdToRemove },
          ],
        },
        data: {
          status: 'REJECTED',
          responseNote: 'Tự động hủy vì nhân sự đã rời khỏi dự án',
        },
      });
    });

    this.socketGateway.broadcastToProject(projectId, 'project:member:removed', {
      projectId,
      userId: userIdToRemove,
      fallbackAssigneeId,
    });

    return {
      success: true,
      message: `Đã xóa thành viên khỏi dự án "${project.name}" và chuyển giao các công việc liên quan cho Quản lý dự án.`,
    };
  }

  // 🗑️ [ADMIN ONLY] Xóa mềm Dự Án (Lưu vào Thùng Rác 14 ngày)
  async softDelete(id: string, userId: string, user?: AuthUserPayload) {
    const currentUser = user || (await this.prisma.user.findUnique({ where: { id: userId } }));
    if (!currentUser || currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Chỉ Quản trị viên (Admin) mới có quyền xóa dự án!');
    }

    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { tasks: true },
    });
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    // 🛡️ [CC-05] Idempotent guard: Nếu dự án đã bị xóa mềm trước đó thì không làm lại
    if (project.isDeleted) {
      return {
        success: true,
        message: `Dự án "${project.name}" đã nằm trong Thùng Rác!`,
      };
    }

    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      // 1. Đánh dấu dự án đã bị xóa
      await tx.project.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: now,
          deletedById: userId,
        },
      });

      // 2. Đánh dấu toàn bộ Task con trong dự án là đã xóa mềm
      await tx.task.updateMany({
        where: { projectId: id, isDeleted: false },
        data: {
          isDeleted: true,
          deletedAt: now,
        },
      });

      // 3. Hủy toàn bộ TaskRequest đang treo
      await tx.taskRequest.updateMany({
        where: { task: { projectId: id }, status: 'PENDING' },
        data: {
          status: 'CANCELLED',
          responseNote: 'Dự án đã bị Quản trị viên chuyển vào Thùng Rác.',
        },
      });
    });

    this.socketGateway.broadcastToProject(id, 'project:deleted', {
      projectId: id,
    });

    return {
      success: true,
      message: `Đã chuyển dự án "${project.name}" vào Thùng Rác (Lưu giữ trong 14 ngày).`,
    };
  }

  // 🔄 [ADMIN ONLY] Khôi phục Dự Án từ Thùng Rác
  async restore(id: string, userId: string, user?: AuthUserPayload) {
    const currentUser = user || (await this.prisma.user.findUnique({ where: { id: userId } }));
    if (!currentUser || currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Chỉ Quản trị viên (Admin) mới có quyền khôi phục dự án!');
    }

    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    // 🛡️ [CC-05] Idempotent guard: Nếu dự án đang hoạt động thì không làm lại
    if (!project.isDeleted) {
      return {
        success: true,
        message: `Dự án "${project.name}" đã ở trạng thái hoạt động!`,
      };
    }

    // 🔒 [LC-99] KIỂM TRA TRÙNG TÊN KHI KHÔI PHỤC DỰ ÁN TỪ THÙNG RÁC
    const activeDuplicate = await this.prisma.project.findFirst({
      where: {
        id: { not: id },
        isDeleted: false,
        name: { equals: project.name, mode: 'insensitive' },
      },
    });
    const restoredName = activeDuplicate
      ? `${project.name} (Khôi phục ${new Date().toLocaleDateString('vi-VN')})`
      : project.name;

    await this.prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id },
        data: {
          name: restoredName,
          isDeleted: false,
          deletedAt: null,
          deletedById: null,
        },
      });

      // Khôi phục các task trong dự án
      await tx.task.updateMany({
        where: { projectId: id, isDeleted: true },
        data: {
          isDeleted: false,
          deletedAt: null,
        },
      });
    });

    this.socketGateway.broadcastToProject(id, 'project:restored', {
      projectId: id,
    });

    return {
      success: true,
      message: `Đã khôi phục dự án "${project.name}" thành công!`,
    };
  }

  // 💥 [ADMIN ONLY] Xóa Vĩnh Viễn Dự Án Khỏi CSDL
  async hardDelete(id: string, userId: string, user?: AuthUserPayload) {
    const currentUser = user || (await this.prisma.user.findUnique({ where: { id: userId } }));
    if (!currentUser || currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Chỉ Quản trị viên (Admin) mới có quyền xóa vĩnh viễn dự án!');
    }

    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException('Dự án không tồn tại!');
    }

    await this.prisma.project.delete({ where: { id } });

    return {
      success: true,
      message: `Đã xóa vĩnh viễn dự án "${project.name}" khỏi CSDL.`,
    };
  }
}
