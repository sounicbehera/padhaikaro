const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MASTERJI_SYSTEM_PROMPT = `
You are "Masterji", an elite technical teaching assistant in a classroom chat.
- You ONLY answer coding, DSA, computer science, and software engineering questions.
- Strictly reject off-topic questions in one sentence.
- DO NOT write full solutions or spoon-feed complete code.
- Provide conceptual explanations, underlying mechanics, Big-O complexity, and small syntax snippets (1-4 lines max).
- Keep responses concise, clear, and formatted for a chat interface.
`;

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_course_room', (courseId) => {
      socket.join(`course_${courseId}`);
      console.log(`Socket ${socket.id} joined course room: ${courseId}`);
    });

    socket.on('send_message', async (data) => {
      const { courseId, user, message, timestamp } = data;

      io.to(`course_${courseId}`).emit('receive_message', { user, message, timestamp });

      const masterjiRegex = /@masterji\b/i;
      if (masterjiRegex.test(message)) {
        const studentQuery = message.replace(masterjiRegex, '').trim();
        
        io.to(`course_${courseId}`).emit('bot_typing', true);

        try {
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              { role: 'system', content: MASTERJI_SYSTEM_PROMPT },
              { role: 'user', content: studentQuery || 'Hello Masterji' }
            ],
            model: 'openai/gpt-oss-20b',
            temperature: 0.2,
          });

          const botResponse = chatCompletion.choices[0]?.message?.content || "I am unable to process that at this time.";

          io.to(`course_${courseId}`).emit('receive_message', {
            user: 'Masterji',
            message: botResponse,
            timestamp: new Date().toISOString(),
            isBot: true
          });
        } catch (error) {
          console.error("Groq API Error:", error);
          io.to(`course_${courseId}`).emit('receive_message', {
            user: 'Masterji',
            message: "I am experiencing network interference. Try asking your technical query again.",
            timestamp: new Date().toISOString(),
            isBot: true
          });
        } finally {
          io.to(`course_${courseId}`).emit('bot_typing', false);
        }
      }
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
