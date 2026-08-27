import { describe, it, expect, vi, beforeEach } from 'vitest';
import { socketService } from './socket';

describe('SocketService', () => {
  beforeEach(() => {
    localStorage.clear();
    socketService.socket = null;
  });

  it('should initialize with disconnected state', () => {
    expect(socketService.socket).toBeNull();
  });

  it('should record and execute reconnect callbacks', () => {
    const callback = vi.fn();
    const unsubscribe = socketService.onReconnect(callback);

    expect(typeof unsubscribe).toBe('function');

    // Manually trigger reconnect list
    (socketService as any).reconnectCallbacks.forEach((cb: () => void) => cb());
    expect(callback).toHaveBeenCalledTimes(1);

    // Test unsubscribe
    unsubscribe();
    (socketService as any).reconnectCallbacks.forEach((cb: () => void) => cb());
    expect(callback).toHaveBeenCalledTimes(1); // Not called again
  });

  it('should emit joinProject with token from localStorage', () => {
    localStorage.setItem('solarisToken', 'jwt-test-token');
    const mockEmit = vi.fn();
    socketService.socket = {
      connected: true,
      emit: mockEmit,
    } as any;

    socketService.joinProject('project-123');
    expect(mockEmit).toHaveBeenCalledWith('joinProject', {
      projectId: 'project-123',
      token: 'jwt-test-token',
    });
  });

  it('should emit joinUser with token from localStorage', () => {
    localStorage.setItem('solarisToken', 'jwt-test-token');
    const mockEmit = vi.fn();
    socketService.socket = {
      connected: true,
      emit: mockEmit,
    } as any;

    socketService.joinUser('user-456');
    expect(mockEmit).toHaveBeenCalledWith('joinUser', {
      userId: 'user-456',
      token: 'jwt-test-token',
    });
  });

  it('should emit leaveProject and leaveUser events', () => {
    const mockEmit = vi.fn();
    socketService.socket = {
      connected: true,
      emit: mockEmit,
    } as any;

    socketService.leaveProject('project-123');
    expect(mockEmit).toHaveBeenCalledWith('leaveProject', { projectId: 'project-123' });

    socketService.leaveUser('user-456');
    expect(mockEmit).toHaveBeenCalledWith('leaveUser', { userId: 'user-456' });
  });

  it('should register and unregister socket event listeners via on() and off()', () => {
    const mockOn = vi.fn();
    const mockOff = vi.fn();
    socketService.socket = {
      on: mockOn,
      off: mockOff,
    } as any;

    const handler = () => {};
    socketService.on('task:updated', handler);
    expect(mockOn).toHaveBeenCalledWith('task:updated', handler);

    socketService.off('task:updated', handler);
    expect(mockOff).toHaveBeenCalledWith('task:updated', handler);
  });
});
