import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useLocalStorage } from '../hooks/useLocalStorage';
// Mock questions - should be replaced with API later
const MOCK_QUESTIONS = [
  {
    id: 1,
    question: 'What is React?',
    options: ['A library', 'A framework', 'A language', 'A database'],
    correctAnswer: 0,
    type: 'multiple-choice'
  },
  {
    id: 2,
    question: 'Which hook is used for state management?',
    options: ['useEffect', 'useState', 'useContext', 'useReducer'],
    correctAnswer: 1,
    type: 'multiple-choice'
  }
];

const Exam = ({ moocId }) => {
  const examId = `exam_${moocId || 1}`;
  const attemptsKey = `attempts_user3_${examId}`;
  
  const [answers, setAnswers] = useState({});
  const [attempts, setAttempts] = useLocalStorage(attemptsKey, []);
  
  // Filter questions by moocId
  const questions = QUESTIONS.filter(q => q.moocId === parseInt(moocId || 1));
  const maxAttempts = 3;
  const remainingAttempts = Math.max(0, maxAttempts - attempts.length);
  
  const handleAnswerChange = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = () => {
    if (remainingAttempts <= 0) {
      alert('Bạn đã hết số lượt thi cho phép.');
      return;
    }

    // Calculate score
    let correctAnswers = 0;
    questions.forEach(question => {
      const selectedOption = question.options.find(opt => opt.id === answers[question.id]);
      if (selectedOption?.correct) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    
    // Save attempt
    const newAttempt = {
      id: Math.random().toString(36).slice(2),
      scorePct: score,
      submittedAt: new Date().toISOString(),
      answers: { ...answers }
    };

    setAttempts(prev => [...prev, newAttempt]);
    
    // Show result
    alert(`Bạn đã hoàn thành bài thi!\nĐiểm số: ${score}%\nSố câu đúng: ${correctAnswers}/${questions.length}`);
    
    // Reset answers for next attempt
    setAnswers({});
  };

  const getBestScore = () => {
    if (attempts.length === 0) {return 0;}
    return Math.max(...attempts.map(a => a.scorePct));
  };

  return (
    <div className="space-y-6">
      {/* Exam Header */}
      <Card>
        <CardHeader>
          <CardTitle>Bài kiểm tra</CardTitle>
          <CardDescription>
            {questions.length} câu hỏi • Tối đa {maxAttempts} lần làm bài
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <span>Lượt còn lại: <strong>{remainingAttempts}</strong></span>
            <span>Điểm cao nhất: <strong>{getBestScore()}%</strong></span>
            <span>Lần thi: <strong>{attempts.length + 1}/{maxAttempts}</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      {remainingAttempts > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Câu hỏi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="p-4 border rounded-xl space-y-3">
                <div className="font-medium">
                  <span className="text-primary">Câu {index + 1}.</span> {question.stem}
                </div>
                
                <div className="grid gap-2">
                  {question.options.map(option => (
                    <label 
                      key={option.id} 
                      className="flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                    >
                      <input
                        type="radio"
                        name={`question_${question.id}`}
                        value={option.id}
                        checked={answers[question.id] === option.id}
                        onChange={() => handleAnswerChange(question.id, option.id)}
                        className="w-4 h-4"
                      />
                      <span className="font-semibold w-8 text-center">
                        {option.label}
                      </span>
                      <span className="flex-1">{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== questions.length}
                size="lg"
              >
                Nộp bài thi
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Bạn đã hết lượt thi</h3>
            <p className="text-muted-foreground mb-4">
              Điểm cao nhất của bạn: <strong>{getBestScore()}%</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Liên hệ giảng viên nếu bạn muốn thi lại.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Previous Attempts */}
      {attempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử làm bài</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attempts.map((attempt, index) => (
                <div 
                  key={attempt.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <span className="font-medium">Lần {index + 1}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {new Date(attempt.submittedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="font-semibold">
                    {attempt.scorePct}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Exam;