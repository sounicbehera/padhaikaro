const fs = require('fs');
const subjects = ['Python', 'C', 'Java', 'DSA'];
const data = {};
subjects.forEach(sub => {
  data[sub] = Array.from({length: 15}).map((_, i) => ({
    id: sub.toLowerCase() + '-q' + (i+1),
    question: 'Sample question ' + (i+1) + ' for ' + sub + '?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    answer: 'Option A' // Simple obfuscation could be done, but keeping it plain for this setup
  }));
});
fs.mkdirSync('src/components/quiz', {recursive: true});
fs.writeFileSync('src/components/quiz/quizData.js', 'export const QUIZ_DATA = ' + JSON.stringify(data, null, 2) + ';');
console.log('Done');
