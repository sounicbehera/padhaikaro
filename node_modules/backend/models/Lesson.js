const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String }, // Markdown content or notes
  videoUrl: { type: String },
  duration: { type: Number }, // Duration in minutes
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
