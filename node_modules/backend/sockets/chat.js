module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a specific course room for real-time discussion
    socket.on('join_course_room', (courseId) => {
      socket.join(`course_${courseId}`);
      console.log(`Socket ${socket.id} joined course room: ${courseId}`);
    });

    // Handle incoming chat messages
    socket.on('send_message', (data) => {
      const { courseId, user, message, timestamp } = data;
      // Broadcast to everyone in the room
      io.to(`course_${courseId}`).emit('receive_message', { user, message, timestamp });
    });

    // Handle live notifications (e.g. instructor announcement)
    socket.on('send_notification', (data) => {
      const { courseId, notification } = data;
      io.to(`course_${courseId}`).emit('receive_notification', notification);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
