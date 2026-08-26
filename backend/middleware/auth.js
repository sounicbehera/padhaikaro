const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlmskey';

const getUser = async (token) => {
  if (!token) return null;
  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decodedToken.userId);
    return user;
  } catch (err) {
    return null;
  }
};

const checkAuth = (user) => {
  if (!user) throw new Error('Unauthenticated');
};

const checkRole = (user, roles) => {
  checkAuth(user);
  if (!roles.includes(user.role)) {
    throw new Error('Unauthorized');
  }
};

module.exports = { getUser, checkAuth, checkRole, JWT_SECRET };
