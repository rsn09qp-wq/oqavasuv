import io from "socket.io-client";
import { API_URL } from "../config";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket.IO connected:", this.socket.id);
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Socket.IO disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export default new SocketService();
