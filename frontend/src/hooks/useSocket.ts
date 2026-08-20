import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

let socket: Socket | null = null;

export const useSocket = () => {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socket) {
      socket = io(window.location.origin, {
        auth: { token: accessToken || undefined },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
    }
    socketRef.current = socket;

    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, [accessToken]);

  const joinElection = useCallback((electionId: number) => {
    socket?.emit('join:election', electionId);
  }, []);

  const leaveElection = useCallback((electionId: number) => {
    socket?.emit('leave:election', electionId);
  }, []);

  const joinLGA = useCallback((lgaId: number) => {
    socket?.emit('join:lga', lgaId);
  }, []);

  const joinWard = useCallback((wardId: number) => {
    socket?.emit('join:ward', wardId);
  }, []);

  const onEvent = useCallback((event: string, handler: (...args: unknown[]) => void) => {
    socket?.on(event, handler);
    return () => {
      socket?.off(event, handler);
    };
  }, []);

  return {
    socket: socketRef.current,
    joinElection,
    leaveElection,
    joinLGA,
    joinWard,
    onEvent,
    isConnected: socket?.connected ?? false,
  };
};
