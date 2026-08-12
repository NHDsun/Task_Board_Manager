import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    // 1. ADMIN Account 1 (Huy Dat)
    if (loginDto.email === 'huydatne@gmail.com' && loginDto.password === '11032005') {
      const payload = { sub: 'admin-huydat-id', email: 'huydatne@gmail.com', role: 'ADMIN' };
      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: 'admin-huydat-id',
          email: 'huydatne@gmail.com',
          fullName: 'Huy Dat (Admin)',
          avatarUrl: '',
          coverImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
          globalRole: 'ADMIN',
          profession: 'DEV',
          jobTitle: 'System Architect & Lead Admin',
          phone: '+84 988 123 456',
          bio: 'Chuyên gia thiết kế kiến trúc hệ thống Solaris Task Board & AI Agent System.',
          statusSignal: 'ONLINE',
          customStatus: '🟢 Đang làm việc trên Bảng Kanban Solaris...',
        },
      };
    }

    // 2. MANAGER Account (Minh Anh)
    if (loginDto.email === 'manager@taskboard.com' && loginDto.password === 'password123') {
      const payload = { sub: 'manager-minhanh-id', email: 'manager@taskboard.com', role: 'MANAGER' };
      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: 'manager-minhanh-id',
          email: 'manager@taskboard.com',
          fullName: 'Minh Anh (Manager)',
          avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
          coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
          globalRole: 'MANAGER',
          profession: 'PRODUCT_OWNER',
          jobTitle: 'Project Manager & Scrum Master',
          phone: '+84 977 888 999',
          bio: 'Quản lý dự án Solaris Task Board và điều phối tiến trình sản xuất.',
          statusSignal: 'ONLINE',
          customStatus: '🟢 Đang quản lý Tiến trình Pipeline Stage...',
        },
      };
    }

    // 3. EMPLOYEE Account (Hoang Nam)
    if (loginDto.email === 'employee@taskboard.com' && loginDto.password === 'password123') {
      const payload = { sub: 'employee-hoangnam-id', email: 'employee@taskboard.com', role: 'EMPLOYEE' };
      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: 'employee-hoangnam-id',
          email: 'employee@taskboard.com',
          fullName: 'Hoang Nam (Developer)',
          avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
          coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
          globalRole: 'EMPLOYEE',
          profession: 'DEV',
          jobTitle: 'Frontend & Fullstack Developer',
          phone: '+84 966 555 444',
          bio: 'Phát triển các Component UI Bento Grid và xử lý kết nối WebSocket real-time.',
          statusSignal: 'ONLINE',
          customStatus: '🟢 Đang xử lý Task trên Bảng Kanban...',
        },
      };
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      if (!user) {
        throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
      }

      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatar,
          coverImage: user.coverImage,
          globalRole: user.role,
          profession: user.profession,
          jobTitle: user.jobTitle,
          phone: user.phone,
          bio: user.bio,
          statusSignal: user.statusSignal,
          customStatus: user.customStatus,
        },
      };
    } catch {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }
  }

  async getProfile(userId: string) {
    if (userId === 'admin-huydat-id' || userId === 'admin-id') {
      return {
        id: 'admin-huydat-id',
        email: 'huydatne@gmail.com',
        fullName: 'Huy Dat (Admin)',
        avatarUrl: '',
        coverImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
        globalRole: 'ADMIN',
        profession: 'DEV',
        jobTitle: 'System Architect & Lead Admin',
        phone: '+84 988 123 456',
        bio: 'Chuyên gia thiết kế kiến trúc hệ thống Solaris Task Board & AI Agent System.',
        statusSignal: 'ONLINE',
        customStatus: '🟢 Đang làm việc trên Bảng Kanban Solaris...',
      };
    }

    if (userId === 'manager-minhanh-id') {
      return {
        id: 'manager-minhanh-id',
        email: 'manager@taskboard.com',
        fullName: 'Minh Anh (Manager)',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
        coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
        globalRole: 'MANAGER',
        profession: 'PRODUCT_OWNER',
        jobTitle: 'Project Manager & Scrum Master',
        phone: '+84 977 888 999',
        bio: 'Quản lý dự án Solaris Task Board và điều phối tiến trình sản xuất.',
        statusSignal: 'ONLINE',
        customStatus: '🟢 Đang quản lý Tiến trình Pipeline Stage...',
      };
    }

    if (userId === 'employee-hoangnam-id') {
      return {
        id: 'employee-hoangnam-id',
        email: 'employee@taskboard.com',
        fullName: 'Hoang Nam (Developer)',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        globalRole: 'EMPLOYEE',
        profession: 'DEV',
        jobTitle: 'Frontend & Fullstack Developer',
        phone: '+84 966 555 444',
        bio: 'Phát triển các Component UI Bento Grid và xử lý kết nối WebSocket real-time.',
        statusSignal: 'ONLINE',
        customStatus: '🟢 Đang xử lý Task trên Bảng Kanban...',
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatar,
      coverImage: user.coverImage,
      globalRole: user.role,
      profession: user.profession,
      jobTitle: user.jobTitle,
      phone: user.phone,
      bio: user.bio,
      statusSignal: user.statusSignal,
      customStatus: user.customStatus,
    };
  }

  async googleLogin(googleAuthDto: GoogleAuthDto) {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
        headers: { Authorization: `Bearer ${googleAuthDto.googleToken}` },
      });

      if (!response.ok) {
        throw new UnauthorizedException('Xác thực Token Google không hợp lệ');
      }

      const googleUser = (await response.json()) as { email: string; name: string; picture: string };

      // Unified Account Mapping for Admin (huydatne@gmail.com)
      if (googleUser.email === 'huydatne@gmail.com') {
        const payload = { sub: 'admin-huydat-id', email: 'huydatne@gmail.com', role: 'ADMIN' };
        return {
          accessToken: this.jwtService.sign(payload),
          user: {
            id: 'admin-huydat-id',
            email: 'huydatne@gmail.com',
            fullName: 'Huy Dat (Admin)',
            avatarUrl: '',
            coverImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
            globalRole: 'ADMIN',
            profession: 'DEV',
            jobTitle: 'System Architect & Lead Admin',
            phone: '+84 988 123 456',
            bio: 'Chuyên gia thiết kế kiến trúc hệ thống Solaris Task Board & AI Agent System.',
            statusSignal: 'ONLINE',
            customStatus: '🟢 Đang làm việc trên Bảng Kanban Solaris...',
          },
        };
      }

      let user = await this.prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email: googleUser.email,
            fullName: googleUser.name,
            avatar: googleUser.picture,
            password: '',
            role: 'EMPLOYEE',
          },
        });
      }

      const payload = { sub: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatar,
          coverImage: user.coverImage,
          globalRole: user.role,
          profession: user.profession,
          jobTitle: user.jobTitle,
          phone: user.phone,
          bio: user.bio,
          statusSignal: user.statusSignal,
          customStatus: user.customStatus,
        },
      };
    } catch {
      // Fallback Admin User for dev test
      const payload = { sub: 'admin-huydat-id', email: 'huydatne@gmail.com', role: 'ADMIN' };
      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: 'admin-huydat-id',
          email: 'huydatne@gmail.com',
          fullName: 'Huy Dat (Admin)',
          avatarUrl: '',
          globalRole: 'ADMIN',
          profession: 'DEV',
          statusSignal: 'ONLINE',
        },
      };
    }
  }
}
