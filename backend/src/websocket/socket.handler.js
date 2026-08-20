const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

function setupSocketHandlers(io) {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      // Allow public connections (situation room)
      socket.userData = { role: 'public' };
      return next();
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userData = decoded;
      next();
    } catch (err) {
      socket.userData = { role: 'public' };
      next();
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (role: ${socket.userData.role})`);

    // Join election room for live updates
    socket.on('join:election', (electionId) => {
      socket.join(`election:${electionId}`);
      logger.debug(`Socket ${socket.id} joined election:${electionId}`);
    });

    // Join specific LGA room
    socket.on('join:lga', (lgaId) => {
      socket.join(`lga:${lgaId}`);
      logger.debug(`Socket ${socket.id} joined lga:${lgaId}`);
    });

    // Join ward room
    socket.on('join:ward', (wardId) => {
      socket.join(`ward:${wardId}`);
      logger.debug(`Socket ${socket.id} joined ward:${wardId}`);
    });

    // Leave rooms
    socket.on('leave:election', (electionId) => {
      socket.leave(`election:${electionId}`);
    });

    socket.on('leave:lga', (lgaId) => {
      socket.leave(`lga:${lgaId}`);
    });

    socket.on('leave:ward', (wardId) => {
      socket.leave(`ward:${wardId}`);
    });

    // Ping/pong for connection health
    socket.on('ping:client', () => {
      socket.emit('pong:server', { timestamp: Date.now() });
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  logger.info('Socket.io handlers initialized');
}

// Helper to broadcast events
function broadcastResultSubmission(io, submission) {
  io.to(`election:${submission.election_id}`).emit('result:submitted', {
    submissionId: submission.id,
    pollingUnitId: submission.polling_unit_id,
    wardId: submission.ward_id,
    lgaId: submission.lga_id,
    status: submission.status,
    timestamp: new Date().toISOString()
  });

  if (submission.lga_id) {
    io.to(`lga:${submission.lga_id}`).emit('result:submitted', {
      submissionId: submission.id,
      pollingUnitId: submission.polling_unit_id,
      wardId: submission.ward_id,
      timestamp: new Date().toISOString()
    });
  }

  if (submission.ward_id) {
    io.to(`ward:${submission.ward_id}`).emit('result:submitted', {
      submissionId: submission.id,
      pollingUnitId: submission.polling_unit_id,
      timestamp: new Date().toISOString()
    });
  }
}

function broadcastResultVerified(io, submission) {
  io.to(`election:${submission.election_id}`).emit('result:verified', {
    submissionId: submission.id,
    pollingUnitId: submission.polling_unit_id,
    wardId: submission.ward_id,
    lgaId: submission.lga_id,
    votes: submission.votes,
    timestamp: new Date().toISOString()
  });
}

function broadcastCollation(io, collation) {
  io.to(`election:${collation.election_id}`).emit('collation:updated', {
    level: collation.level,
    entityId: collation.entity_id,
    votes: collation.votes,
    timestamp: new Date().toISOString()
  });
}

function broadcastDisputeUpdate(io, dispute) {
  io.to(`election:${dispute.election_id}`).emit('dispute:updated', {
    disputeId: dispute.id,
    status: dispute.status,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  setupSocketHandlers,
  broadcastResultSubmission,
  broadcastResultVerified,
  broadcastCollation,
  broadcastDisputeUpdate
};
