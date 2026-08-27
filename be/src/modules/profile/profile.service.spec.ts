import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ProfileService', () => {
  let service: ProfileService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    task: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile if user exists', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'dev@solaris.io',
        fullName: 'Solaris Developer',
        avatar: 'avatar.png',
        coverImage: 'cover.png',
        role: 'EMPLOYEE',
        profession: 'DEV',
        jobTitle: 'Senior Fullstack',
        phone: '0123456789',
        bio: 'Coding with passion',
        statusSignal: 'ONLINE',
        customStatus: 'Coding',
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('user-1');
      expect(result.email).toBe('dev@solaris.io');
      expect(result.globalRole).toBe('EMPLOYEE');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('non-existing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPersonalStats', () => {
    it('should accurately calculate personal statistics without duplicate counting', async () => {
      mockPrismaService.task.count
        .mockResolvedValueOnce(5) // completedTasks (DONE)
        .mockResolvedValueOnce(3) // inProgressTasks (IN_PROGRESS)
        .mockResolvedValueOnce(2) // overdueTasks (dueDate < now)
        .mockResolvedValueOnce(12); // totalAssignedTasks (all non-deleted)

      const stats = await service.getPersonalStats('user-1');

      expect(stats).toEqual({
        completedTasks: 5,
        inProgressTasks: 3,
        overdueTasks: 2,
        totalAssignedTasks: 12,
      });

      expect(mockPrismaService.task.count).toHaveBeenCalledTimes(4);
    });
  });
});
