'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Only connect on client side
    if (typeof window === 'undefined') return;

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      path: '/api/socketio',
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return socket;
}