const socketIo = require("socket.io");

let io = null;
const userSockets = new Map(); // Maps userId -> set of socketIds (handling multiple open tabs/connections)

const initSocket = (server) => {
  const allowedOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map(val => val.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  // Default allowed origins
  if (allowedOrigins.length === 0) {
    allowedOrigins.push("http://localhost:5173");
    allowedOrigins.push("http://localhost:3000");
  }
  // Include '*' if allowed in server CORS config
  const corsOrigin = allowedOrigins.includes("*") ? "*" : allowedOrigins;

  io = socketIo(server, {
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Register user session
    socket.on("register", (userId) => {
      if (userId) {
        const idStr = String(userId);
        socket.userId = idStr;
        if (!userSockets.has(idStr)) {
          userSockets.set(idStr, new Set());
        }
        userSockets.get(idStr).add(socket.id);
        console.log(`Registered user ${idStr} on socket ${socket.id}`);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.userId && userSockets.has(socket.userId)) {
        const sockets = userSockets.get(socket.userId);
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(socket.userId);
        }
      }
    });
  });

  return io;
};

const getIo = () => {
  return io;
};

/**
 * Emit an event to all active sockets of a specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {any} data - Event payload
 */
const emitToUser = (userId, event, data) => {
  if (!io) return;
  const idStr = String(userId);
  if (userSockets.has(idStr)) {
    const sockets = userSockets.get(idStr);
    sockets.forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
  }
};

module.exports = {
  initSocket,
  getIo,
  emitToUser
};
