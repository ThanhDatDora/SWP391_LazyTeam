# Exam System Design - Question Bank & Random Selection

## 📊 Database Schema

### Current Tables (Already Exist)
```sql
- exams (exam_id, mooc_id, name, duration_minutes, attempts_allowed, passing_score)
- submissions (submission_id, exam_id, user_id, score, submitted_at)
```

### NEW Tables Needed

#### 1. **question_bank** (Ngân hàng câu hỏi)
```sql
CREATE TABLE question_bank (
  question_id BIGINT PRIMARY KEY IDENTITY(1,1),
  exam_id BIGINT FOREIGN KEY REFERENCES exams(exam_id),
  question_text NVARCHAR(MAX) NOT NULL,
  question_type VARCHAR(20) NOT NULL, -- 'multiple_choice', 'true_false', 'multiple_answer'
  difficulty_level VARCHAR(20) NOT NULL, -- 'easy', 'medium', 'hard'
  points INT DEFAULT 1,
  correct_answer NVARCHAR(500), -- For single answer
  explanation NVARCHAR(MAX), -- Giải thích đáp án
  created_at DATETIME DEFAULT GETDATE(),
  is_active BIT DEFAULT 1
);
```

#### 2. **question_options** (Các đáp án cho câu hỏi)
```sql
CREATE TABLE question_options (
  option_id BIGINT PRIMARY KEY IDENTITY(1,1),
  question_id BIGINT FOREIGN KEY REFERENCES question_bank(question_id),
  option_text NVARCHAR(500) NOT NULL,
  is_correct BIT DEFAULT 0,
  option_order INT
);
```

#### 3. **exam_instances** (Mỗi lần thi của user - random questions)
```sql
CREATE TABLE exam_instances (
  instance_id BIGINT PRIMARY KEY IDENTITY(1,1),
  exam_id BIGINT FOREIGN KEY REFERENCES exams(exam_id),
  user_id BIGINT FOREIGN KEY REFERENCES users(user_id),
  attempt_number INT,
  questions_json NVARCHAR(MAX), -- JSON array of selected question IDs
  start_time DATETIME,
  end_time DATETIME,
  time_remaining_sec INT,
  status VARCHAR(20), -- 'in_progress', 'completed', 'expired'
  score DECIMAL(5,2),
  max_score INT,
  created_at DATETIME DEFAULT GETDATE()
);
```

#### 4. **exam_answers** (Câu trả lời của user cho từng instance)
```sql
CREATE TABLE exam_answers (
  answer_id BIGINT PRIMARY KEY IDENTITY(1,1),
  instance_id BIGINT FOREIGN KEY REFERENCES exam_instances(instance_id),
  question_id BIGINT FOREIGN KEY REFERENCES question_bank(question_id),
  selected_answer NVARCHAR(MAX), -- JSON for multiple answers
  is_correct BIT,
  points_earned DECIMAL(5,2),
  answered_at DATETIME DEFAULT GETDATE()
);
```

---

## 🎯 Exam Flow

### **1. Instructor creates exam with question bank**
```javascript
// Create exam
POST /api/exams
{
  mooc_id: 52,
  name: "Photography Midterm Exam",
  duration_minutes: 90,
  attempts_allowed: 2,
  passing_score: 70,
  total_questions: 30,
  question_distribution: {
    easy: 10,    // 10 câu dễ (33%)
    medium: 15,  // 15 câu trung bình (50%)
    hard: 5      // 5 câu khó (17%)
  }
}

// Add 100 questions to question bank
POST /api/exams/:examId/questions
[
  {
    question_text: "What is the exposure triangle?",
    question_type: "multiple_choice",
    difficulty_level: "easy",
    points: 1,
    options: [
      { text: "ISO, Aperture, Shutter Speed", is_correct: true },
      { text: "Focus, Zoom, Flash", is_correct: false },
      { text: "Camera, Lens, Tripod", is_correct: false },
      { text: "Red, Green, Blue", is_correct: false }
    ],
    explanation: "The exposure triangle consists of ISO, Aperture, and Shutter Speed."
  },
  // ... 99 more questions
]
```

---

### **2. Student starts exam (Random selection)**
```javascript
// Start exam attempt
POST /api/exams/:examId/start
Response:
{
  instance_id: 1234,
  attempt_number: 1,
  questions: [ // Random 30 questions from 100
    {
      question_id: 45,
      question_text: "What is ISO?",
      question_type: "multiple_choice",
      difficulty_level: "easy",
      points: 1,
      options: [
        { option_id: 180, text: "Sensor sensitivity" },
        { option_id: 181, text: "Lens aperture" },
        { option_id: 182, text: "Shutter speed" },
        { option_id: 183, text: "Focus distance" }
      ]
      // NO is_correct field - hide from student
    },
    // ... 29 more questions
  ],
  duration_minutes: 90,
  start_time: "2025-11-03T10:00:00Z",
  expires_at: "2025-11-03T11:30:00Z"
}
```

**Random Selection Algorithm**:
```javascript
// Backend logic
async function generateExamInstance(examId, userId, attemptNumber) {
  const exam = await getExam(examId);
  const questionBank = await getQuestionBank(examId);
  
  // Separate by difficulty
  const easy = questionBank.filter(q => q.difficulty_level === 'easy');
  const medium = questionBank.filter(q => q.difficulty_level === 'medium');
  const hard = questionBank.filter(q => q.difficulty_level === 'hard');
  
  // Random selection
  const selectedQuestions = [
    ...randomSelect(easy, exam.distribution.easy),      // 10 easy
    ...randomSelect(medium, exam.distribution.medium),  // 15 medium
    ...randomSelect(hard, exam.distribution.hard)       // 5 hard
  ];
  
  // Shuffle order
  shuffle(selectedQuestions);
  
  // Save instance
  const instance = await createExamInstance({
    exam_id: examId,
    user_id: userId,
    attempt_number: attemptNumber,
    questions_json: JSON.stringify(selectedQuestions.map(q => q.question_id)),
    start_time: new Date(),
    time_remaining_sec: exam.duration_minutes * 60,
    status: 'in_progress'
  });
  
  return {
    instance_id: instance.id,
    questions: selectedQuestions.map(q => ({
      question_id: q.question_id,
      question_text: q.question_text,
      options: q.options.map(o => ({
        option_id: o.option_id,
        text: o.option_text
        // Hide is_correct
      }))
    }))
  };
}
```

---

### **3. Student takes exam (Timer running)**
```javascript
// Auto-save answer (every time student selects)
POST /api/exams/instances/:instanceId/answer
{
  question_id: 45,
  selected_answer: [180], // option_id
  time_remaining_sec: 5100 // 85 minutes left
}

// Get current progress
GET /api/exams/instances/:instanceId
Response:
{
  instance_id: 1234,
  status: 'in_progress',
  time_remaining_sec: 5100,
  answered_questions: 15,
  total_questions: 30,
  questions: [...] // Same questions
}
```

**Frontend Timer**:
```javascript
// ExamPage.jsx
const [timeRemaining, setTimeRemaining] = useState(instance.time_remaining_sec);

useEffect(() => {
  const timer = setInterval(() => {
    setTimeRemaining(prev => {
      if (prev <= 0) {
        autoSubmitExam(); // Hết giờ tự động nộp
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  
  return () => clearInterval(timer);
}, []);

// Auto-save every 30 seconds
useEffect(() => {
  const autosave = setInterval(() => {
    saveProgress(timeRemaining);
  }, 30000);
  
  return () => clearInterval(autosave);
}, [answers, timeRemaining]);
```

---

### **4. Submit exam (Grading)**
```javascript
// Submit exam
POST /api/exams/instances/:instanceId/submit
{
  answers: [
    { question_id: 45, selected_answer: [180] },
    { question_id: 67, selected_answer: [245, 246] }, // Multiple answers
    // ... 30 answers
  ]
}

// Backend grading
async function gradeExam(instanceId, answers) {
  const instance = await getExamInstance(instanceId);
  const questions = await getQuestionsForInstance(instance);
  
  let totalScore = 0;
  let maxScore = 0;
  
  const gradedAnswers = [];
  
  for (const answer of answers) {
    const question = questions.find(q => q.question_id === answer.question_id);
    maxScore += question.points;
    
    const isCorrect = checkAnswer(question, answer.selected_answer);
    const pointsEarned = isCorrect ? question.points : 0;
    totalScore += pointsEarned;
    
    gradedAnswers.push({
      question_id: answer.question_id,
      selected_answer: answer.selected_answer,
      is_correct: isCorrect,
      points_earned: pointsEarned
    });
    
    // Save to exam_answers table
    await saveExamAnswer({
      instance_id: instanceId,
      question_id: answer.question_id,
      selected_answer: JSON.stringify(answer.selected_answer),
      is_correct: isCorrect,
      points_earned: pointsEarned
    });
  }
  
  const percentage = (totalScore / maxScore) * 100;
  
  // Update instance
  await updateExamInstance(instanceId, {
    status: 'completed',
    end_time: new Date(),
    score: percentage,
    max_score: maxScore
  });
  
  return {
    score: percentage,
    passed: percentage >= exam.passing_score,
    total_correct: gradedAnswers.filter(a => a.is_correct).length,
    total_questions: answers.length,
    // Don't show correct answers immediately if exam.show_answers_after is set
  };
}

Response:
{
  instance_id: 1234,
  score: 85.5,
  passed: true,
  total_correct: 26,
  total_questions: 30,
  attempt_number: 1,
  attempts_remaining: 1,
  message: "Congratulations! You passed the exam."
}
```

---

### **5. View results (After submission)**
```javascript
// Get exam results
GET /api/exams/instances/:instanceId/results
Response:
{
  instance_id: 1234,
  exam_name: "Photography Midterm Exam",
  score: 85.5,
  passed: true,
  total_correct: 26,
  total_questions: 30,
  attempt_number: 1,
  submitted_at: "2025-11-03T11:15:00Z",
  time_taken_minutes: 75,
  
  // Show answers after exam (if allowed)
  show_answers: true,
  questions: [
    {
      question_id: 45,
      question_text: "What is ISO?",
      your_answer: [180],
      correct_answer: [180],
      is_correct: true,
      explanation: "ISO refers to sensor sensitivity...",
      points_earned: 1,
      points_possible: 1
    },
    {
      question_id: 67,
      question_text: "Which are primary colors?",
      your_answer: [245],
      correct_answer: [245, 246, 247],
      is_correct: false,
      explanation: "Primary colors are Red, Green, and Blue (RGB).",
      points_earned: 0,
      points_possible: 2
    },
    // ... 28 more
  ]
}
```

---

## 🎨 Frontend Components

### **ExamPage.jsx**
```jsx
const ExamPage = () => {
  const [instance, setInstance] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  return (
    <div className="exam-container">
      {/* Header with timer */}
      <ExamHeader 
        examName={instance.exam_name}
        timeRemaining={timeRemaining}
        progress={`${currentQuestion + 1} / ${instance.questions.length}`}
      />
      
      {/* Question navigator */}
      <QuestionNavigator 
        questions={instance.questions}
        currentQuestion={currentQuestion}
        answers={answers}
        onQuestionClick={setCurrentQuestion}
      />
      
      {/* Question content */}
      <QuestionCard
        question={instance.questions[currentQuestion]}
        answer={answers[instance.questions[currentQuestion].question_id]}
        onAnswerChange={handleAnswerChange}
      />
      
      {/* Navigation buttons */}
      <ExamNavigation
        currentQuestion={currentQuestion}
        totalQuestions={instance.questions.length}
        onPrevious={() => setCurrentQuestion(prev => prev - 1)}
        onNext={() => setCurrentQuestion(prev => prev + 1)}
        onSubmit={handleSubmit}
        answeredCount={Object.keys(answers).length}
      />
    </div>
  );
};
```

---

## 📋 Sample Question Bank (100 questions)

```javascript
const photographyQuestionBank = [
  // EASY (40 questions)
  {
    question_text: "What does ISO stand for in photography?",
    difficulty_level: "easy",
    points: 1,
    options: [
      { text: "International Standards Organization", is_correct: true },
      { text: "Image Sensor Output", is_correct: false },
      { text: "Internal Shutter Operation", is_correct: false },
      { text: "Instant Snapshot Option", is_correct: false }
    ]
  },
  // ... 39 more easy
  
  // MEDIUM (40 questions)
  {
    question_text: "What aperture setting provides the shallowest depth of field?",
    difficulty_level: "medium",
    points: 2,
    options: [
      { text: "f/1.4", is_correct: true },
      { text: "f/8", is_correct: false },
      { text: "f/16", is_correct: false },
      { text: "f/22", is_correct: false }
    ]
  },
  // ... 39 more medium
  
  // HARD (20 questions)
  {
    question_text: "In the reciprocal rule, if you're using a 200mm lens, what is the minimum shutter speed to avoid camera shake?",
    difficulty_level: "hard",
    points: 3,
    options: [
      { text: "1/200 second", is_correct: true },
      { text: "1/100 second", is_correct: false },
      { text: "1/500 second", is_correct: false },
      { text: "1/60 second", is_correct: false }
    ]
  },
  // ... 19 more hard
];
```

---

## ✅ Implementation Priority

1. ✅ **Phase 1**: Database schema (create tables)
2. ✅ **Phase 2**: Backend APIs (CRUD for question bank)
3. ✅ **Phase 3**: Random selection algorithm
4. ✅ **Phase 4**: Frontend exam interface
5. ✅ **Phase 5**: Timer & auto-save
6. ✅ **Phase 6**: Grading system
7. ✅ **Phase 7**: Results & analytics

---

Bạn muốn tôi:
1. **Tạo database schema ngay** (create tables)?
2. **Implement backend APIs** cho exam system?
3. **Build frontend exam interface** với timer?
