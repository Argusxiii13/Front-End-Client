import { io } from 'socket.io-client';

let socketInstance = null;

export const getSocket = () => {
  if (socketInstance) return socketInstance;

  socketInstance = io(process.env.NEXT_PUBLIC_BASE_URL, {
    transports: ['websocket'],
    autoConnect: true,
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (!socketInstance) return;
  socketInstance.disconnect();
  socketInstance = null;
};
