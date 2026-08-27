import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore, type DirectoryUser } from './useUserStore';

describe('useUserStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default directory users', () => {
    const users = useUserStore.getState().users;
    expect(users.length).toBeGreaterThan(0);
    expect(users.some((u) => u.globalRole === 'ADMIN')).toBe(true);
  });

  it('should add a new user to the directory', () => {
    const newUser: DirectoryUser = {
      id: 'u-new-1',
      fullName: 'New Member',
      email: 'new@solaris.io',
      globalRole: 'EMPLOYEE',
      profession: 'DEV',
      jobTitle: 'Frontend Dev',
      department: 'Engineering',
      statusSignal: 'ONLINE',
      isActive: true,
      joinedDate: '27/08/2026',
      projectsCount: 0,
      tasksCount: { total: 0, completed: 0, inProgress: 0, overdue: 0 },
      workMode: 'OFFICE',
    };

    useUserStore.getState().addUser(newUser);
    const users = useUserStore.getState().users;
    expect(users.some((u) => u.id === 'u-new-1')).toBe(true);
  });

  it('should update an existing directory user', () => {
    const firstUserId = useUserStore.getState().users[0].id;
    useUserStore.getState().updateDirectoryUser(firstUserId, { jobTitle: 'Lead Architect 2026' });

    const updatedUser = useUserStore.getState().users.find((u) => u.id === firstUserId);
    expect(updatedUser?.jobTitle).toBe('Lead Architect 2026');
  });

  it('should update lock status of a user via updateDirectoryUser', () => {
    const firstUserId = useUserStore.getState().users[0].id;
    const initialActive = useUserStore.getState().users[0].isActive;

    useUserStore.getState().updateDirectoryUser(firstUserId, { isActive: !initialActive });
    const toggledUser = useUserStore.getState().users.find((u) => u.id === firstUserId);
    expect(toggledUser?.isActive).toBe(!initialActive);
  });

  it('should delete a user from directory', () => {
    const userToDelete: DirectoryUser = {
      id: 'u-temp-delete',
      fullName: 'To Be Deleted',
      email: 'delete@solaris.io',
      globalRole: 'EMPLOYEE',
      profession: 'DEV',
      jobTitle: 'Temporary',
      department: 'Engineering',
      statusSignal: 'OFFLINE',
      isActive: false,
      joinedDate: '27/08/2026',
      projectsCount: 0,
      tasksCount: { total: 0, completed: 0, inProgress: 0, overdue: 0 },
      workMode: 'OFFICE',
    };

    useUserStore.getState().addUser(userToDelete);
    expect(useUserStore.getState().users.some((u) => u.id === 'u-temp-delete')).toBe(true);

    useUserStore.getState().deleteUser('u-temp-delete');
    expect(useUserStore.getState().users.some((u) => u.id === 'u-temp-delete')).toBe(false);
  });
});
