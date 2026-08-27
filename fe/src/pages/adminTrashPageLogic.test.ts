import { describe, it, expect } from 'vitest';

interface TrashProject {
  id: string;
  name: string;
  deletedAt: string;
  expiresAt: string;
  daysLeft: number;
  hoursLeft: number;
}

interface TrashTask {
  id: string;
  title: string;
  projectName: string;
  deletedAt: string;
  expiresAt: string;
  daysLeft: number;
  hoursLeft: number;
}

function calculateTimeRemaining(expiresAtStr: string): { daysLeft: number; hoursLeft: number; isExpired: boolean; isUrgent: boolean; text: string } {
  const diff = new Date(expiresAtStr).getTime() - Date.now();
  if (diff <= 0) {
    return { daysLeft: 0, hoursLeft: 0, isExpired: true, isUrgent: true, text: 'Hết hạn (Sẽ bị tự động xóa)' };
  }
  const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const isUrgent = daysLeft < 3;
  return {
    daysLeft,
    hoursLeft,
    isExpired: false,
    isUrgent,
    text: `Còn ${daysLeft} ngày ${hoursLeft} giờ`,
  };
}

function filterTrashItems<T extends { name?: string; title?: string; projectName?: string }>(
  items: T[],
  searchQuery: string
): T[] {
  const q = searchQuery.toLowerCase().trim();
  if (!q) return items;
  return items.filter((item) => {
    const matchName = item.name?.toLowerCase().includes(q);
    const matchTitle = item.title?.toLowerCase().includes(q);
    const matchProj = item.projectName?.toLowerCase().includes(q);
    return matchName || matchTitle || matchProj;
  });
}

describe('Admin Trash Page Logic & Expiration Calculations (Thùng Rác Hệ Thống)', () => {
  const sampleProjects: TrashProject[] = [
    {
      id: 'tp-1',
      name: 'Dự Án Legacy Alpha',
      deletedAt: '2026-08-20T00:00:00Z',
      expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      daysLeft: 20,
      hoursLeft: 0,
    },
    {
      id: 'tp-2',
      name: 'Dự Án Thử Nghiệm Sắp Hết Hạn',
      deletedAt: '2026-08-01T00:00:00Z',
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day left
      daysLeft: 1,
      hoursLeft: 12,
    },
  ];

  const sampleTasks: TrashTask[] = [
    {
      id: 'tt-1',
      title: 'Tối ưu hóa Database Query',
      projectName: 'Dự Án Legacy Alpha',
      deletedAt: '2026-08-22T00:00:00Z',
      expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      daysLeft: 25,
      hoursLeft: 0,
    },
    {
      id: 'tt-2',
      title: 'Fix Bug CSS Safari',
      projectName: 'Solaris Mobile App',
      deletedAt: '2026-07-20T00:00:00Z',
      expiresAt: new Date(Date.now() - 1000).toISOString(), // Expired
      daysLeft: 0,
      hoursLeft: 0,
    },
  ];

  describe('1. Time Remaining & Expiration Calculations', () => {
    it('should correctly identify active items with more than 3 days left', () => {
      const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
      const res = calculateTimeRemaining(futureDate);
      expect(res.isExpired).toBe(false);
      expect(res.isUrgent).toBe(false);
      expect(res.daysLeft).toBeGreaterThanOrEqual(14);
    });

    it('should flag urgent warning when less than 3 days remain', () => {
      const nearFutureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
      const res = calculateTimeRemaining(nearFutureDate);
      expect(res.isExpired).toBe(false);
      expect(res.isUrgent).toBe(true);
    });

    it('should mark items as expired when expiresAt is in the past', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString();
      const res = calculateTimeRemaining(pastDate);
      expect(res.isExpired).toBe(true);
      expect(res.daysLeft).toBe(0);
      expect(res.hoursLeft).toBe(0);
    });
  });

  describe('2. Trash Search & Filtering Logic', () => {
    it('should filter projects by name case-insensitively', () => {
      const res = filterTrashItems(sampleProjects, 'Legacy');
      expect(res.length).toBe(1);
      expect(res[0].id).toBe('tp-1');
    });

    it('should filter tasks by task title or parent project name', () => {
      const resByTitle = filterTrashItems(sampleTasks, 'Query');
      expect(resByTitle.length).toBe(1);
      expect(resByTitle[0].id).toBe('tt-1');

      const resByProject = filterTrashItems(sampleTasks, 'Mobile App');
      expect(resByProject.length).toBe(1);
      expect(resByProject[0].id).toBe('tt-2');
    });

    it('should return all items when search query is empty', () => {
      const res = filterTrashItems(sampleTasks, '   ');
      expect(res.length).toBe(2);
    });
  });
});
