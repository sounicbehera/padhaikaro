import React, { useState, useEffect } from 'react';
import { getQuizData as getFallbackData } from '../components/quiz/quizData';
import { useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';

const GET_QUIZZES = gql`
  query GetQuizzes {
    getQuizzes {
      subject
      questions {
        id
        question
        options
        answer
      }
    }
  }
`;

const SAVE_QUIZZES = gql`
  mutation SaveQuizzes($quizzes: [QuizInput]!) {
    saveQuizzes(quizzes: $quizzes)
  }
`;

const AdminQuizManager = () => {
  const [quizData, setQuizData] = useState({});
  const [activeSubject, setActiveSubject] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const navigate = useNavigate();

  const { data, loading } = useQuery(GET_QUIZZES, { fetchPolicy: 'network-only' });
  const [saveQuizzesMut] = useMutation(SAVE_QUIZZES);

  useEffect(() => {
    if (loading) return;
    let loadedData = {};
    if (data && data.getQuizzes && data.getQuizzes.length > 0) {
      data.getQuizzes.forEach(q => {
        loadedData[q.subject] = q.questions.map(question => {
          // Remove __typename before setting state
          const { __typename, ...rest } = question;
          return rest;
        });
      });
    } else {
      loadedData = getFallbackData();
    }
    setQuizData(loadedData);
    const subjects = Object.keys(loadedData);
    if (subjects.length > 0) {
      setActiveSubject(subjects[0]);
    }
  }, [data, loading]);

  const handleSave = async () => {
    try {
      const formattedQuizzes = Object.keys(quizData).map(subject => ({
        subject,
        questions: quizData[subject].map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
          answer: q.answer
        }))
      }));
      await saveQuizzesMut({ variables: { quizzes: formattedQuizzes } });
      alert('Quiz data saved successfully to database!');
    } catch (e) {
      console.error(e);
      alert('Failed to save quiz data: ' + e.message);
    }
  };

  const handleQuestionChange = (id, field, value) => {
    setQuizData(prev => ({
      ...prev,
      [activeSubject]: prev[activeSubject].map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleOptionChange = (id, optionIndex, value) => {
    setQuizData(prev => ({
      ...prev,
      [activeSubject]: prev[activeSubject].map(q => {
        if (q.id === id) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    }));
  };

  const addQuestion = () => {
    const newQ = {
      id: `${activeSubject.toLowerCase()}-q${Date.now()}`,
      question: 'New Question',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'Option A'
    };
    setQuizData(prev => ({
      ...prev,
      [activeSubject]: [...(prev[activeSubject] || []), newQ]
    }));
    setEditingQuestion(newQ.id);
  };

  const deleteQuestion = (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuizData(prev => ({
        ...prev,
        [activeSubject]: prev[activeSubject].filter(q => q.id !== id)
      }));
      if (editingQuestion === id) setEditingQuestion(null);
    }
  };

  const addSubject = () => {
    const name = window.prompt("Enter new quiz subject name:");
    if (name && !quizData[name]) {
      setQuizData(prev => ({
        ...prev,
        [name]: []
      }));
      setActiveSubject(name);
    }
  };

  if (!activeSubject && Object.keys(quizData).length === 0) return <div>Loading...</div>;

  return (
    <div className="bg-background min-h-screen text-on-surface p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-outline-variant pb-4">
        <div>
          <h1 className="text-3xl font-bold">Quiz Manager</h1>
          <p className="text-on-surface-variant">Edit subjects, questions, and answers.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-surface-variant text-on-surface-variant rounded hover:bg-surface-variant/80 transition font-medium">
            Back to Dashboard
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-primary text-on-primary rounded font-bold hover:bg-primary/90 transition shadow-sm">
            Save All Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Subjects List */}
        <div className="bg-surface-container p-4 rounded-xl border border-outline-variant h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Subjects</h2>
            <button onClick={addSubject} className="text-primary font-bold text-xl leading-none hover:opacity-80">+</button>
          </div>
          <div className="space-y-2">
            {Object.keys(quizData).map(sub => (
              <button 
                key={sub}
                onClick={() => { setActiveSubject(sub); setEditingQuestion(null); }}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition ${activeSubject === sub ? 'bg-primary text-on-primary' : 'hover:bg-surface-variant'}`}
              >
                {sub} ({quizData[sub]?.length || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Questions Editor */}
        <div className="md:col-span-3 bg-surface p-6 rounded-xl border border-outline-variant shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Editing: {activeSubject}</h2>
            <button onClick={addQuestion} className="px-4 py-2 bg-primary-container text-on-primary-container font-medium rounded hover:bg-primary-container/80 transition">
              + Add Question
            </button>
          </div>
          
          <div className="space-y-6">
            {quizData[activeSubject]?.map((q, idx) => (
              <div key={q.id} className={`border rounded-lg overflow-hidden ${editingQuestion === q.id ? 'border-primary shadow-sm' : 'border-outline-variant'}`}>
                <div 
                  className="bg-surface-container px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-surface-variant transition"
                  onClick={() => setEditingQuestion(editingQuestion === q.id ? null : q.id)}
                >
                  <span className="font-bold truncate pr-4">Q{idx + 1}: {q.question}</span>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }} className="text-error hover:underline text-sm font-medium">Delete</button>
                  </div>
                </div>
                
                {editingQuestion === q.id && (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Question Text</label>
                      <input 
                        type="text" 
                        value={q.question} 
                        onChange={(e) => handleQuestionChange(q.id, 'question', e.target.value)}
                        className="w-full bg-background border border-outline rounded p-2 focus:border-primary focus:outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx}>
                          <label className="block text-sm font-medium mb-1">Option {String.fromCharCode(65 + oIdx)}</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name={`correct-${q.id}`} 
                              checked={q.answer === opt}
                              onChange={() => handleQuestionChange(q.id, 'answer', opt)}
                              className="w-4 h-4 text-primary"
                              title="Mark as correct answer"
                            />
                            <input 
                              type="text" 
                              value={opt} 
                              onChange={(e) => handleOptionChange(q.id, oIdx, e.target.value)}
                              className={`flex-1 bg-background border rounded p-2 focus:border-primary focus:outline-none ${q.answer === opt ? 'border-primary ring-1 ring-primary/20' : 'border-outline'}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-sm text-on-surface-variant mt-2 italic">
                      * Select the radio button next to an option to mark it as the correct answer.
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {(!quizData[activeSubject] || quizData[activeSubject].length === 0) && (
              <div className="text-center py-10 text-on-surface-variant border-2 border-dashed border-outline-variant rounded-xl">
                No questions found for this subject.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuizManager;
