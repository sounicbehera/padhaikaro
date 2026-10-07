import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { getQuizData as getFallbackData } from '../components/quiz/quizData';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import TimerWidget from '../components/quiz/TimerWidget';
import QuestionCard from '../components/quiz/QuestionCard';
import ResultSummary from '../components/quiz/ResultSummary';
import CertificateTemplate from '../components/quiz/CertificateTemplate';
import { GET_DASHBOARD_DATA } from '../graphql/dashboardQueries';

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

const ADD_CERTIFICATE = gql`
  mutation AddCertificate($title: String!, $issueDate: String, $type: String) {
    addCertificate(title: $title, issueDate: $issueDate, type: $type) {
      id
      certificates {
        title
        issueDate
      }
    }
  }
`;

const QuizPage = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const activeSubject = decodeURIComponent(subject);
  
  const { data: gqlData, loading } = useQuery(GET_QUIZZES, { fetchPolicy: 'network-only' });
  const { data: dashboardData } = useQuery(GET_DASHBOARD_DATA);
  const studentName = dashboardData?.me?.name || "Student";
  const [addCertificate] = useMutation(ADD_CERTIFICATE, {
    refetchQueries: [{ query: GET_DASHBOARD_DATA }]
  });
  
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [score, setScore] = useState(0);
  const certRef = useRef(null);
  const DURATION = 30; // 30 minutes

  // Recover state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('activeQuizState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.subject === activeSubject && parsed.startTime) {
          setAnswers(parsed.answers || {});
          setStartTime(parsed.startTime);
          setIsSubmitted(parsed.isSubmitted || false);
          setScore(parsed.score || 0);
          setHasStarted(parsed.hasStarted || false);
        }
      } catch (e) {
        console.error("Failed to parse quiz state", e);
      }
    }
  }, [activeSubject]);

  // Save state whenever it changes
  useEffect(() => {
    if (hasStarted && startTime) {
      localStorage.setItem('activeQuizState', JSON.stringify({
        subject: activeSubject,
        answers,
        startTime,
        isSubmitted,
        score,
        hasStarted
      }));
    }
  }, [activeSubject, answers, startTime, isSubmitted, score, hasStarted]);

  const handleStartQuiz = () => {
    setStartTime(Date.now());
    setHasStarted(true);
  };

  const handleAnswer = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const getQuizDataObj = () => {
    let quizData = {};
    if (gqlData && gqlData.getQuizzes && gqlData.getQuizzes.length > 0) {
      gqlData.getQuizzes.forEach(q => {
        quizData[q.subject] = q.questions;
      });
    } else {
      quizData = getFallbackData();
    }
    return quizData;
  };

  const submitQuiz = () => {
    const quizData = getQuizDataObj();
    const questions = quizData[activeSubject];
    if (!questions) return;
    
    let calculatedScore = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.answer) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setIsSubmitted(true);

    if (calculatedScore / questions.length >= 0.6) {
      const issueDate = new Date().toLocaleDateString();
      const title = `${activeSubject} Certification`;
      
      // Save to Backend Database
      addCertificate({ variables: { title, issueDate, type: 'primary' } }).catch(e => console.error(e));

      // Keep localStorage logic for offline/mock support
      const existingCerts = JSON.parse(localStorage.getItem('earnedCertificates') || '[]');
      const existingIndex = existingCerts.findIndex(c => c.subject === activeSubject);
      
      if (existingIndex !== -1) {
        // Update the existing certificate
        existingCerts[existingIndex].score = calculatedScore;
        existingCerts[existingIndex].total = questions.length;
        existingCerts[existingIndex].issueDate = issueDate;
      } else {
        // Add new certificate
        existingCerts.push({
          id: `cert-${Date.now()}`,
          title: title,
          issueDate: issueDate,
          type: 'primary',
          subject: activeSubject,
          score: calculatedScore,
          total: questions.length,
          name: studentName
        });
      }
      localStorage.setItem('earnedCertificates', JSON.stringify(existingCerts));
    }
  };

  const downloadCertificate = async () => {
    try {
      console.log("Starting PDF generation...");
      if (!certRef.current) {
        alert("Certificate template is not ready.");
        return;
      }
      
      const imgData = await toPng(certRef.current, { pixelRatio: 2, fontEmbedCSS: '' });
      console.log("Image data generated successfully");
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1280, 1122]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 1280, 1122);
      pdf.save(`${activeSubject}_Certificate.pdf`);
      console.log("PDF downloaded successfully");
    } catch (error) {
      console.error("Failed to generate certificate:", error);
      alert("Failed to download the certificate: " + error.message);
    }
  };

  const closeQuiz = () => {
    localStorage.removeItem('activeQuizState');
    window.close(); // Try closing the tab
    navigate('/catalog'); // Fallback if window.close() doesn't work
  };

  if (loading) return <div className="p-10 text-center text-on-surface">Loading quiz...</div>;

  const quizData = getQuizDataObj();
  const questions = quizData[activeSubject];
  if (!questions) {
    return <div className="p-10 text-center text-on-surface">Quiz not found.</div>;
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <ResultSummary 
          score={score} 
          total={questions.length} 
          subject={activeSubject}
          onDownload={downloadCertificate}
          onClose={closeQuiz}
        />
        <CertificateTemplate 
          ref={certRef}
          name={studentName}
          subject={activeSubject}
          score={score}
          total={questions.length}
        />
      </div>
    );
  }

  // Pre-quiz instructions screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-surface-container p-8 rounded-xl shadow-md border border-outline-variant">
          <h1 className="text-3xl font-bold text-on-surface mb-2">{activeSubject} Certification Assessment</h1>
          <p className="text-on-surface-variant mb-8">Please read the instructions carefully before starting the exam.</p>
          
          <div className="bg-surface p-6 rounded-lg border border-outline-variant mb-8 space-y-4">
            <h3 className="text-xl font-bold text-on-surface border-b border-outline-variant pb-2">Assessment Details</h3>
            <ul className="list-disc pl-5 space-y-2 text-on-surface">
              <li><strong>Duration:</strong> {DURATION} Minutes</li>
              <li><strong>Total Questions:</strong> {questions.length} Multiple-Choice Questions</li>
              <li><strong>Passing Criteria:</strong> 60% or higher to earn the certificate</li>
              <li><strong>Attempts Allowed:</strong> Unlimited</li>
            </ul>
            
            <h3 className="text-xl font-bold text-on-surface border-b border-outline-variant pb-2 mt-6">Guidelines</h3>
            <ul className="list-disc pl-5 space-y-2 text-on-surface">
              <li>Do not close this window during the test. Your progress is saved, but time will continue to tick.</li>
              <li>Ensure you have a stable internet connection.</li>
              <li>Once the timer expires, the quiz will be automatically submitted.</li>
              <li>You can review your results and download your certificate immediately upon passing.</li>
            </ul>
          </div>
          
          <div className="flex justify-end gap-4">
            <button 
              onClick={() => { window.close(); navigate('/catalog'); }} 
              className="px-6 py-2 text-on-surface-variant bg-surface-variant hover:bg-surface-variant/80 rounded-md font-medium transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleStartQuiz} 
              className="px-8 py-2 bg-primary text-on-primary rounded-md font-bold hover:bg-primary/90 transition shadow-sm"
            >
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl bg-surface-container-low p-6 rounded-xl shadow-sm border border-outline-variant">
        <div className="flex justify-between items-center mb-6 bg-surface p-4 rounded-lg shadow-sm border border-outline-variant sticky top-4 z-10">
          <div>
            <h2 className="text-xl font-bold text-on-surface">{activeSubject} Assessment</h2>
            <p className="text-sm text-on-surface-variant">Complete all questions before the timer runs out.</p>
          </div>
          <TimerWidget 
            startTime={startTime} 
            durationMinutes={DURATION} 
            onExpire={submitQuiz} 
          />
        </div>

        <div className="space-y-6">
          {questions.map((q, i) => (
            <div key={q.id}>
              <span className="text-sm font-bold text-primary mb-2 block">Question {i + 1} of {questions.length}</span>
              <QuestionCard 
                question={q} 
                selectedAnswer={answers[q.id]} 
                onSelect={(opt) => handleAnswer(q.id, opt)} 
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={submitQuiz}
            className="px-8 py-3 bg-primary text-on-primary text-lg font-bold rounded-lg shadow hover:bg-primary/90 transition"
          >
            Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
