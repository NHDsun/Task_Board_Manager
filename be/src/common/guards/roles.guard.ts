import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu API không đặt nhãn vai trò đặc thù thì cho phép truy cập
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Nếu chưa đăng nhập hoặc không có thông tin user
    if (!user) {
      return false;
    }

    // Quyền ADMIN luôn có toàn quyền trên mọi API
    if (user.role === Role.ADMIN) {
      return true;
    }

    // Kiểm tra xem vai trò của user có nằm trong mảng danh sách vai trò được phép không
    return requiredRoles.includes(user.role);
  }
}
