import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  public socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    const token = localStorage.getItem('solarisToken');

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token || '',
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('⚡ Connected to Socket.IO Server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO Server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinProject(projectId: string) {
    if (this.socket) {
      this.socket.emit('joinProject', { projectId });
    }
  }

  leaveProject(projectId: string) {
    if (this.socket) {
      this.socket.emit('leaveProject', { projectId });
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketService = new SocketService();
