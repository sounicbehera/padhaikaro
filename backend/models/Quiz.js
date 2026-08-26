const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  questions: [{
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true }
  }],
  passingScore: { type: Number, default: 50 } // percentage
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
