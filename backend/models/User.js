const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Instructor', 'Admin'], default: 'Student' },
  avatar: { type: String },
  points: { type: Number, default: 0 },
  scholarStatus: { type: String, default: 'Bronze Scholar' },
  weeklyGoal: {
    targetHours: { type: Number, default: 10 },
    completedPercentage: { type: Number, default: 0 }
  },
  recentActivity: [{
    title: String,
    subtitle: String,
    type: { type: String },
    timeAgo: String
  }],
  certificates: [{
    title: String,
    issueDate: String,
    type: { type: String }
  }],
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  isVerified: { type: Boolean, default: false },
  lastReadNotificationsAt: { type: Date, default: Date.now },
  otp: { type: String },
  otpExpiry: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
