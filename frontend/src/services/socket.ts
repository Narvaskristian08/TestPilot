import { io, Socket } from 'socket.io-client';
import { TestStatusEvent } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: TestStatusEvent) => void>> = new Map();

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    this.socket.on('test-status', (data: TestStatusEvent) => {
      const listeners = this.listeners.get(`test-${data.runId}`);
      if (listeners) {
        listeners.forEach(callback => callback(data));
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Subscribe to test run updates
   */
  subscribeToTest(runId: number, callback: (data: TestStatusEvent) => void): () => void {
    if (!this.socket?.connected) {
      this.connect();
    }

    const key = `test-${runId}`;
    
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
      this.socket?.emit('subscribe', String(runId));
    }

    this.listeners.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        
        if (listeners.size === 0) {
          this.listeners.delete(key);
          this.socket?.emit('unsubscribe', String(runId));
        }
      }
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
