import { io } from "socket.io-client";

const socket = io(process.env.EXPO_PUBLIC_API_URI, {
  autoConnect: false, // Root layout will handle connect()
  transports: ["polling", "websocket"], // Polling is safer for initial handshake
  reconnection: true,
  reconnectionAttempts: Infinity, // Keep trying
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

export default socket;
