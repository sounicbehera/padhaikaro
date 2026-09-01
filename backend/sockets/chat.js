module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);


    socket.on('join_course_room', (courseId) => {
      socket.join(`course_${courseId}`);
      console.log(`Socket ${socket.id} joined course room: ${courseId}`);
    });


    socket.on('send_message', (data) => {
      const { courseId, user, message, timestamp } = data;

      io.to(`course_${courseId}`).emit('receive_message', { user, message, timestamp });
    });


    socket.on('send_notification', (data) => {
      const { courseId, notification } = data;
      io.to(`course_${courseId}`).emit('receive_notification', notification);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
