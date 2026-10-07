const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  subject: { type: String, required: true, unique: true },
  questions: [{
    id: { type: String },
    question: { type: String },
    options: [{ type: String }],
    answer: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
