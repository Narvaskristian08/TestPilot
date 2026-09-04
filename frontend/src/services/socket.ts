import { io, Socket } from 'socket.io-client';
import { TestStatusEvent } from '../types';
import { config } from '../config';
import { apiClient } from './api';

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

    this.socket = io(config.socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: {
        token: apiClient.getAuthToken(),
        guestFingerprint: apiClient.getGuestFingerprint(),
      },
    });

    this.socket.on('connect', () => {
      console.log('[socket] WebSocket connected');
      this.listeners.forEach((_listeners, key) => {
        this.socket?.emit('subscribe', key.replace('test-', ''));
      });
    });

    this.socket.on('disconnect', () => {
      console.log('[socket] WebSocket disconnected');
    });

    const dispatch = (data: TestStatusEvent) => {
      const listeners = this.listeners.get(`test-${data.runId}`);
      if (listeners) {
        listeners.forEach(callback => callback(data));
      }
    };

    this.socket.on('test:progress', dispatch);
    this.socket.on('test:update', dispatch);
  }

  refreshIdentity(): void {
    if (!this.socket) return;

    const shouldReconnect = this.socket.connected || this.listeners.size > 0;
    this.socket.disconnect();
    if (shouldReconnect) {
      this.connect();
    }
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
    const key = `test-${runId}`;

    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(callback);

    if (!this.socket) {
      this.connect();
    } else if (this.socket.connected) {
      this.socket.emit('subscribe', String(runId));
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        
        if (listeners.size === 0) {
          this.listeners.delete(key);
          if (this.socket?.connected) {
            this.socket.emit('unsubscribe', String(runId));
          }
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
