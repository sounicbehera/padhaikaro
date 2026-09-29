const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  progressPercentage: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Completed', 'Dropped'], default: 'Active' },
  enrolledAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
