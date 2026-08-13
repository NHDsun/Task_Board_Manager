import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
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
        avatarUrl: user.avatar || '',
        coverImage: user.coverImage || '',
        globalRole: user.role,
        profession: user.profession,
        jobTitle: user.jobTitle,
        phone: user.phone,
        bio: user.bio,
        statusSignal: user.statusSignal,
        customStatus: user.customStatus,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại trong CSDL');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatar || '',
      coverImage: user.coverImage || '',
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
    let googleUser: { email: string; name: string; picture: string };

    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
        headers: { Authorization: `Bearer ${googleAuthDto.googleToken}` },
      });

      if (!response.ok) {
        throw new UnauthorizedException('Xác thực Token Google không hợp lệ');
      }

      googleUser = (await response.json()) as { email: string; name: string; picture: string };
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Không thể xác thực thông tin tài khoản với Google');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    // 🔒 NẾU GMAIL CHƯA CÓ TRONG CSDL -> TỪ CHỐI ĐĂNG NHẬP THEO QUY ĐỊNH
    if (!user) {
      throw new UnauthorizedException('Gmail này không hợp lệ hoặc chưa được cấp quyền truy cập hệ thống');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatar || '',
        coverImage: user.coverImage || '',
        globalRole: user.role,
        profession: user.profession,
        jobTitle: user.jobTitle,
        phone: user.phone,
        bio: user.bio,
        statusSignal: user.statusSignal,
        customStatus: user.customStatus,
      },
    };
  }
}
