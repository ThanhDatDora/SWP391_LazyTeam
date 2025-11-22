# 🎯 Quiz Question Bank Integration - Complete Guide

## 📋 Overview

**Status**: ✅ COMPLETED  
**Date**: 2025  
**Objective**: Upgrade Quiz system from inline JSON questions to Question Bank integration

---

## 🔄 What Changed?

### Before (Old Quiz System)
- Quiz questions stored as **JSON array** in `lessons.content_url`
- Instructor must manually create questions for **each Quiz**
- Questions **NOT reusable** across different Quizzes
- Difficult to manage and update questions

**Example Old Format:**
```json
{
  "type": "quiz",
  "quiz_id": null,
  "description": "Kiểm tra kiến thức...",
  "timeLimit": 10,
  "passingScore": 70,
  "questions": [
    {
      "id": 1,
      "question": "Câu hỏi 1?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 2
    }
  ]
}
```

### After (New Quiz System with Question Bank)
- Quiz stores **configuration only** in `lessons.content_url`
- Questions fetched from **Question Bank** at runtime
- Each attempt gets **different random questions** (like Exam)
- Instructor creates questions **once** in Question Bank, use in **multiple Quizzes**
- Easy to manage, update, and reuse questions

**Example New Format:**
```json
{
  "type": "quiz_v2",
  "numQuestions": 5,
  "timeLimit": 10,
  "passingScore": 70,
  "description": "Kiểm tra kiến thức..."
}
```

---

## 🛠️ Technical Changes

### 1. Frontend - Instructor Course Management

**File**: `src/pages/instructor/InstructorCourseManagement.jsx`

#### Added Quiz to Content Type Dropdown
```jsx
<SelectItem value="quiz">Quiz (Bài kiểm tra)</SelectItem>
```

#### Added Quiz Configuration Form
```jsx
{lessonForm.content_type === 'quiz' && (
  <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
    <h4>Cấu hình Quiz (sử dụng Question Bank)</h4>
    <div className="grid grid-cols-3 gap-4">
      <div>
        <label>Số câu hỏi *</label>
        <Input type="number" min="1" max="20" value={numQuestions} />
      </div>
      <div>
        <label>Thời gian (phút) *</label>
        <Input type="number" min="1" max="60" value={timeLimit} />
      </div>
      <div>
        <label>Điểm đạt (%) *</label>
        <Input type="number" min="0" max="100" value={passingScore} />
      </div>
    </div>
  </div>
)}
```

#### Updated handleSaveLesson
```javascript
// Validation
if (lessonForm.content_type === 'quiz') {
  if (!lessonForm.numQuestions || lessonForm.numQuestions < 1) {
    toast.error('Số câu hỏi phải >= 1');
    return;
  }
  // ... other validations
}

// Serialization
if (lessonForm.content_type === 'quiz') {
  dataToSend.content_url = JSON.stringify({
    type: 'quiz_v2',
    numQuestions: lessonForm.numQuestions || 5,
    timeLimit: lessonForm.timeLimit || 10,
    passingScore: lessonForm.passingScore || 70,
    description: lessonForm.description || ''
  });
}
```

#### Updated handleEditLesson
```javascript
if (lesson.content_type === 'quiz' && lesson.content_url) {
  const quizData = JSON.parse(lesson.content_url);
  if (quizData.type === 'quiz_v2') {
    numQuestions = quizData.numQuestions || 5;
    timeLimit = quizData.timeLimit || 10;
    passingScore = quizData.passingScore || 70;
    description = quizData.description || '';
  }
}
```

---

### 2. Frontend - Quiz Display Component

**File**: `src/components/learning/QuizLesson.jsx`

#### Added Loading State
```javascript
const [loading, setLoading] = React.useState(true);
```

#### Fetch Questions from Question Bank
```javascript
React.useEffect(() => {
  const loadQuizData = async () => {
    const parsed = JSON.parse(lesson.content_url);
    
    if (parsed.type === 'quiz_v2') {
      // Fetch random questions from Question Bank
      const response = await fetch(
        `${BACKEND_URL}/api/question-bank/mooc/${lesson.mooc_id}/random?limit=${parsed.numQuestions}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const data = await response.json();
      
      // Transform to quiz format
      const questions = data.data.map(q => ({
        id: q.question_id,
        question: q.stem,
        options: q.options.map(opt => opt.content),
        correctAnswer: q.options.findIndex(opt => opt.is_correct === 1)
      }));

      setQuizData({
        type: 'quiz_v2',
        description: parsed.description,
        timeLimit: parsed.timeLimit,
        passingScore: parsed.passingScore,
        questions: questions
      });
    }
  };

  loadQuizData();
}, [lesson.content_url, lesson.mooc_id]);
```

#### Added Loading UI
```jsx
if (loading) {
  return (
    <div className="text-center">
      <div className="animate-spin ..."></div>
      <h3>Đang tải Quiz...</h3>
      <p>Đang chuẩn bị câu hỏi từ Question Bank</p>
    </div>
  );
}
```

---

### 3. Backend - Question Bank API

**File**: `backend/routes/question-bank.js`

#### Added Random Questions Endpoint
```javascript
/**
 * Get random questions from a MOOC (for Quiz)
 * GET /api/question-bank/mooc/:moocId/random?limit=5
 */
router.get('/mooc/:moocId/random', authenticateToken, async (req, res) => {
  const { moocId } = req.params;
  const limit = parseInt(req.query.limit) || 5;

  // Get random questions (only mcq and tf)
  const questionsResult = await pool.request()
    .input('moocId', sql.BigInt, moocId)
    .input('limit', sql.Int, limit)
    .query(`
      SELECT TOP (@limit)
        q.question_id,
        q.stem,
        q.qtype,
        q.difficulty,
        q.max_score
      FROM questions q
      WHERE q.mooc_id = @moocId AND q.qtype IN ('mcq', 'tf')
      ORDER BY NEWID()  -- Random order
    `);

  // Get options for questions
  const optionsResult = await pool.request()
    .query(`
      SELECT 
        option_id, question_id, label, content, is_correct
      FROM question_options
      WHERE question_id IN (${questionIds.join(',')})
      ORDER BY question_id, label
    `);

  // Group options by question
  const questionsWithOptions = questions.map(q => ({
    ...q,
    options: optionsMap[q.question_id] || []
  }));

  res.json({ success: true, data: questionsWithOptions });
});
```

---

## 📊 Database Schema

No changes required! Uses existing tables:

- **questions**: Stores all questions in Question Bank
- **question_options**: Stores multiple choice options
- **lessons**: `content_url` stores Quiz config (not questions)

---

## 🎓 How to Use (Instructor Guide)

### Step 1: Create Questions in Question Bank
1. Go to Course Management
2. Click "Question Bank" button for a MOOC
3. Create questions (MCQ or True/False)
4. Questions are now available for ALL Quizzes in this MOOC

### Step 2: Create Quiz Lesson
1. Click "Thêm bài học" (Add Lesson)
2. Select "Quiz (Bài kiểm tra)" as content type
3. Configure Quiz:
   - **Số câu hỏi**: How many random questions (e.g., 5)
   - **Thời gian**: Time limit in minutes (e.g., 10)
   - **Điểm đạt**: Passing score percentage (e.g., 70%)
4. Click "Tạo mới"

### Step 3: Quiz is Ready!
- Learners will see Quiz in lesson list
- Each time they start Quiz, they get **different random questions**
- Questions come from Question Bank (not hardcoded)

---

## 🎯 Benefits of New System

### For Instructors
✅ **Create questions once**, use in multiple Quizzes  
✅ **Easy to update** - edit in Question Bank, all Quizzes updated  
✅ **No JSON editing** - simple form to configure  
✅ **Question statistics** - see which questions exist

### For Learners
✅ **Different questions each time** - can retry without memorizing  
✅ **Fair assessment** - random selection prevents cheating  
✅ **Same Quiz experience** - identical UI to old format

### For System
✅ **Better data structure** - questions in proper database tables  
✅ **Reusable content** - DRY principle  
✅ **Easier maintenance** - no complex JSON parsing  
✅ **Backward compatible** - old Quizzes still work

---

## 🔧 API Endpoints

### Get Random Questions
```
GET /api/question-bank/mooc/:moocId/random?limit=5
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "question_id": 1082,
      "stem": "What is React?",
      "qtype": "mcq",
      "options": [
        {"label": "A", "content": "A library", "is_correct": 1},
        {"label": "B", "content": "A framework", "is_correct": 0}
      ]
    }
  ]
}
```

---

## 🧪 Testing Checklist

### Create New Quiz
- [ ] Select Quiz content type
- [ ] Configure numQuestions, timeLimit, passingScore
- [ ] Save Quiz lesson
- [ ] Verify content_url contains quiz_v2 config

### View Quiz as Learner
- [ ] Open Quiz lesson
- [ ] See loading state
- [ ] Questions load from Question Bank
- [ ] Can answer and submit
- [ ] Score calculated correctly

### Random Questions
- [ ] Start Quiz attempt 1 - note questions
- [ ] Retry Quiz - verify different questions
- [ ] Confirm random selection from Question Bank

### Backward Compatibility
- [ ] Old Quiz format still works
- [ ] Can edit old Quiz (shows as legacy)
- [ ] No breaking changes for existing Quizzes

---

## 🚀 Next Steps (Optional Enhancements)

1. **Quiz Statistics Dashboard**
   - Show how many times each question was answered
   - Track pass/fail rates per Quiz

2. **Difficulty-based Selection**
   - Random questions by difficulty level
   - Progressive difficulty in Quiz

3. **Question Tags/Categories**
   - Tag questions by topic
   - Select questions from specific topics

4. **Quiz Attempts History**
   - Save learner's Quiz attempts to database
   - Show history of scores and answers

---

## 🎉 Summary

Quiz system upgraded from inline JSON to Question Bank integration:
- **Frontend**: Added Quiz form in InstructorCourseManagement.jsx
- **Frontend**: Modified QuizLesson.jsx to fetch from API
- **Backend**: Added random questions endpoint
- **Result**: Instructor creates questions once, use in many Quizzes

**Status**: ✅ Ready for Testing

---

## 📝 Files Modified

1. `src/pages/instructor/InstructorCourseManagement.jsx`
   - Added Quiz content type
   - Added Quiz config form (numQuestions, timeLimit, passingScore)
   - Updated handleSaveLesson for Quiz serialization
   - Updated handleEditLesson for Quiz deserialization

2. `src/components/learning/QuizLesson.jsx`
   - Added loading state
   - Fetch random questions from Question Bank API
   - Transform Question Bank format to quiz format
   - Show loading UI while fetching

3. `backend/routes/question-bank.js`
   - Added GET /mooc/:moocId/random endpoint
   - Random selection with NEWID()
   - Filter by qtype (mcq, tf only)
   - Return questions with options

---

**Created by**: GitHub Copilot  
**Date**: 2025  
**Version**: 1.0
