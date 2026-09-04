import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { config } from '../config';
import { apiClient } from '../services/api';

interface TestProgressEvent {
  testName: string;
  testType: string;
  status: string;
  message?: string;
  timestamp: string;
}

interface TestUpdateEvent {
  runId: number;
  status: string;
  data?: any;
  timestamp: string;
}

export function useTestProgress(runId: number | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [progress, setProgress] = useState<TestProgressEvent[]>([]);
  const [status, setStatus] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!runId) return;

    // Connect to WebSocket
    const newSocket = io(config.socketUrl, {
      transports: ['websocket', 'polling'],
      auth: {
        token: apiClient.getAuthToken(),
        guestFingerprint: apiClient.getGuestFingerprint(),
      },
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Join the test room
      newSocket.emit('subscribe', String(runId));
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    // Listen for test progress
    newSocket.on('test:progress', (event: TestProgressEvent) => {
      setProgress(prev => [...prev, event]);
    });

    // Listen for test updates (status changes)
    newSocket.on('test:update', (event: TestUpdateEvent) => {
      if (event.runId === runId) {
        setStatus(event.status);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('unsubscribe', String(runId));
      newSocket.close();
    };
  }, [runId]);

  const clearProgress = () => {
    setProgress([]);
  };

  return {
    progress,
    status,
    isConnected,
    socket,
    clearProgress,
  };
}
