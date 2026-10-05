require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { getUser } = require('./middleware/auth');
const setupSockets = require('./sockets/chat');

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: ['https://padhaikarolms.netlify.app', 'http://localhost:5173'], 
    methods: ['GET', 'POST'],
    credentials: true
  }
});
setupSockets(io);

// Middleware
app.use(cors({
  origin: ['https://padhaikarolms.netlify.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '500mb' }));

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms';

// Apollo Server setup
const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.split(' ')[1] || '';
        const user = await getUser(token);
        return { user };
      },
    })
  );

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/graphql`);
    console.log(`Socket.io server running on http://localhost:${PORT}`);
  });
};

startServer().catch(err => console.error(err));
