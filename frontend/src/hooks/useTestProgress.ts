import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { config } from '../config';

interface TestProgressEvent {
  testName: string;
  testType: string;
  status: 'running' | 'completed' | 'failed';
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
    const newSocket = io(config.apiUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Join the test room
      newSocket.emit('join', `test-${runId}`);
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
      newSocket.emit('leave', `test-${runId}`);
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
