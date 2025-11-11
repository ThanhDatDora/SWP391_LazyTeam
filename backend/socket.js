import { Server } from 'socket.io';import { Server } from 'socket.io';import { Server } from 'socket.io';



let io;



export function initializeSocket(server) {let io;let io;

  io = new Server(server, {

    cors: {

      origin: process.env.FRONTEND_URL || 'http://localhost:5173',

      methods: ['GET', 'POST'],/**/**

      credentials: true

    } * Initialize Socket.IO server * Initialize Socket.IO server

  });

 * @param {import('http').Server} server - HTTP server instance * @param {import('http').Server} server - HTTP server instance

  io.on('connection', (socket) => {

    console.log('🔌 Socket connected:', socket.id); */ */



    socket.on('join-user-room', (userId) => {export function initializeSocket(server) {export function initializeSocket(server) {

      socket.join(`user-${userId}`);

      console.log(`👤 User ${userId} joined room: user-${userId}`);  io = new Server(server, {  io = new Server(server, {

    });

    cors: {    cors: {

    socket.on('disconnect', () => {

      console.log('🔌 Socket disconnected:', socket.id);      origin: process.env.FRONTEND_URL || 'http://localhost:5173',      origin: process.env.FRONTEND_URL || 'http://localhost:5173',

    });

  });      methods: ['GET', 'POST'],      methods: ['GET', 'POST'],



  console.log('✅ Socket.IO initialized');      credentials: true      credentials: true

  return io;

}    }    }



export function getIO() {  });  });

  if (!io) {

    throw new Error('Socket.IO not initialized');

  }

  return io;  io.on('connection', (socket) => {  io.on('connection', (socket) => {

}

    console.log('🔌 Socket connected:', socket.id);    console.log('🔌 New WebSocket connection:', socket.id);

export function emitAccountLocked(userId, fullName) {

  if (!io) {

    console.error('❌ Socket.IO not initialized');

    return;    // User joins their personal room    // User joins their personal room based on user_id

  }

    socket.on('join-user-room', (userId) => {    socket.on('join-user-room', (userId) => {

  console.log(`🔒 Emitting account-locked to user ${userId}`);

  io.to(`user-${userId}`).emit('account-locked', {      socket.join(`user-${userId}`);      socket.join(`user-${userId}`);

    userId,

    fullName,      console.log(`👤 User ${userId} joined room: user-${userId}`);      console.log(`👤 User ${userId} joined their room`);

    timestamp: new Date().toISOString()

  });    });    });

}



export default { initializeSocket, getIO, emitAccountLocked };

    socket.on('disconnect', () => {    socket.on('disconnect', () => {

      console.log('🔌 Socket disconnected:', socket.id);      console.log('🔌 WebSocket disconnected:', socket.id);

    });    });

  });  });



  console.log('✅ Socket.IO initialized');  console.log('✅ Socket.IO initialized');

  return io;  return io;

}}



/**/**

 * Get Socket.IO instance * Get Socket.IO instance

 */ * @returns {Server} Socket.IO server instance

export function getIO() { */

  if (!io) {export function getIO() {

    throw new Error('Socket.IO not initialized. Call initializeSocket first.');  if (!io) {

  }    throw new Error('Socket.IO not initialized. Call initializeSocket first.');

  return io;  }

}  return io;

}

/**

 * Emit account-locked event to specific user/**

 * @param {number} userId - User ID to notify * Emit user-locked event to specific user

 * @param {string} fullName - User's full name * @param {number} userId - User ID to lock out

 */ * @param {string} reason - Reason for lock

export function emitAccountLocked(userId, fullName) { */

  if (!io) {export function emitUserLocked(userId, reason = 'Tài khoản của bạn đã bị khóa do vi phạm chính sách') {

    console.error('❌ Socket.IO not initialized, cannot emit account-locked');  if (!io) {

    return;    console.error('❌ Socket.IO not initialized, cannot emit user-locked event');

  }    return;

  }

  console.log(`🔒 Emitting account-locked to user ${userId} (${fullName})`);

  io.to(`user-${userId}`).emit('account-locked', {  console.log(`🔒 Emitting user-locked event to user ${userId}`);

    userId,  io.to(`user-${userId}`).emit('user-locked', {

    fullName,    userId,

    timestamp: new Date().toISOString()    reason,

  });    timestamp: new Date().toISOString()

}  });

}

export default { initializeSocket, getIO, emitAccountLocked };

/**
 * Emit user-unlocked event to specific user
 * @param {number} userId - User ID to unlock
 */
export function emitUserUnlocked(userId) {
  if (!io) {
    console.error('❌ Socket.IO not initialized, cannot emit user-unlocked event');
    return;
  }

  console.log(`🔓 Emitting user-unlocked event to user ${userId}`);
  io.to(`user-${userId}`).emit('user-unlocked', {
    userId,
    timestamp: new Date().toISOString()
  });
}

export default { initializeSocket, getIO, emitUserLocked, emitUserUnlocked };
