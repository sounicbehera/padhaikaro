const fs = require('fs');
let content = fs.readFileSync('src/components/quiz/quizData.js', 'utf8');
content = content.replace('export const QUIZ_DATA =', 'const DEFAULT_QUIZ_DATA =');
content += `

export const getQuizData = () => {
  const local = localStorage.getItem('adminQuizData');
  if (local) {
    try {
      return JSON.parse(local);
    } catch(e) {}
  }
  return DEFAULT_QUIZ_DATA;
};

export const saveQuizData = (data) => {
  localStorage.setItem('adminQuizData', JSON.stringify(data));
};
`;
fs.writeFileSync('src/components/quiz/quizData.js', content);
