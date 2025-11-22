# Assignment Grading System - Testing Guide

## ✅ Completed Implementation

### Backend APIs
- ✅ `/api/assignments/submit` - Student submits assignment
- ✅ `/api/assignments/grade` - Instructor grades (with role check)
- ✅ `/api/assignments/lesson/:lessonId/submissions` - Get all submissions (instructor only)
- ✅ `/api/instructor/courses/:courseId/moocs` - MOOC management
- ✅ `/api/instructor/lessons` - Lesson CRUD
- ✅ `/api/instructor/courses/:courseId/students` - Student list

### Frontend Pages
- ✅ `InstructorCourseManagement.jsx` - Full course content management
- ✅ `AssignmentGrading.jsx` - Assignment grading interface
- ✅ Routing configured in `AppRouter.jsx`
- ✅ UI components: Dialog, Select

### Security
- ✅ Role-based access control (instructor, admin)
- ✅ JWT authentication on all protected routes
- ✅ Middleware: `authorizeRoles('instructor', 'admin')`

## 🧪 Testing Workflow

### Test 1: Student Submits Assignment

1. **Login as Student**
   - Navigate to: `http://localhost:5173/auth`
   - Login with student account

2. **Go to Course**
   - Navigate to any enrolled course
   - Find a lesson with `content_type = 'assignment'`

3. **Submit Assignment**
   - Write text content or upload file
   - Click submit
   - Verify success message

4. **Check Database**
   ```sql
   SELECT * FROM essay_submissions 
   ORDER BY submitted_at DESC;
   ```

### Test 2: Instructor Grades Assignment

1. **Login as Instructor**
   - Logout student, login as instructor
   - Navigate to: `http://localhost:5173/instructor/dashboard`

2. **Access Course Management**
   - Click on a course card
   - Should see: `http://localhost:5173/instructor/courses/{courseId}`

3. **Go to Assignments Tab**
   - Click "Assignments" tab
   - Should see list of pending submissions

4. **Grade Assignment**
   - Click "Chấm điểm" button
   - Should navigate to: `/instructor/courses/{courseId}/assignments/grade?lessonId={lessonId}`
   - Enter score (0-100)
   - Enter feedback (min 10 characters)
   - Click "Submit Grading"

5. **Verify Grading**
   - Check status changes from "Pending" to "Graded"
   - Check score displays correctly
   - Verify database update:
   ```sql
   SELECT 
     essay_submission_id,
     score,
     feedback,
     status,
     graded_by,
     graded_at
   FROM essay_submissions
   WHERE essay_submission_id = {submission_id};
   ```

### Test 3: MOOC & Lesson Management

1. **Create New MOOC**
   - Go to course management page
   - Click "Thêm MOOC mới"
   - Fill form and submit
   - Verify MOOC appears in list

2. **Create New Lesson**
   - Click "Thêm bài học" for a MOOC
   - Select content type (video/assignment/reading)
   - Fill details and submit
   - Verify lesson appears in MOOC

3. **Edit Lesson**
   - Click edit icon on a lesson
   - Modify details
   - Save and verify changes

4. **Delete Lesson**
   - Click delete icon
   - Confirm deletion
   - Verify lesson removed

### Test 4: Student Views Graded Assignment

1. **Login as Student**
   - Navigate back to the course
   - Go to the assignment lesson

2. **View Results**
   - Should see score and feedback
   - Status should show "Graded"
   - Verify feedback text displays correctly

## 🔍 Common Issues & Solutions

### Issue 1: "Insufficient permissions" error
**Solution**: Verify user's role in database
```sql
SELECT u.user_id, u.email, u.full_name, r.role_name
FROM users u
JOIN roles r ON u.role_id = r.role_id
WHERE u.email = 'your-email@example.com';
```

### Issue 2: Submissions not showing
**Solution**: Check lesson has `content_type = 'assignment'`
```sql
SELECT lesson_id, title, content_type 
FROM lessons 
WHERE content_type = 'assignment';
```

### Issue 3: File upload fails
**Solution**: Ensure `uploads/assignments/` directory exists
```powershell
New-Item -ItemType Directory -Force -Path "backend\uploads\assignments"
```

### Issue 4: Dialog/Select components not rendering
**Solution**: Clear browser cache and hard reload (Ctrl+Shift+R)

## 📊 Database Verification Queries

### Check All Assignments
```sql
SELECT 
  es.essay_submission_id,
  u.full_name as student_name,
  l.title as lesson_title,
  es.status,
  es.score,
  es.submitted_at,
  es.graded_at,
  g.full_name as grader_name
FROM essay_submissions es
JOIN users u ON es.user_id = u.user_id
JOIN lessons l ON es.task_id = l.lesson_id
LEFT JOIN users g ON es.graded_by = g.user_id
ORDER BY es.submitted_at DESC;
```

### Check Instructor's Courses
```sql
SELECT 
  c.course_id,
  c.title,
  c.owner_instructor_id,
  u.full_name as instructor_name,
  COUNT(DISTINCT m.mooc_id) as mooc_count,
  COUNT(DISTINCT l.lesson_id) as lesson_count
FROM courses c
JOIN users u ON c.owner_instructor_id = u.user_id
LEFT JOIN moocs m ON c.course_id = m.course_id
LEFT JOIN lessons l ON m.mooc_id = l.mooc_id
GROUP BY c.course_id, c.title, c.owner_instructor_id, u.full_name;
```

## 🎯 Next Steps (Optional Enhancements)

1. **Bulk Grading**
   - Grade multiple submissions at once
   - Apply same feedback to multiple students

2. **Export Grades**
   - Download CSV/Excel of all grades
   - Include student info, scores, submission dates

3. **Analytics Dashboard**
   - Average score per assignment
   - Submission completion rate
   - Time-to-grade metrics
   - Student performance charts

4. **Notifications**
   - Email student when graded
   - Push notification for new submissions
   - Reminder for pending grading

5. **Rich Text Editor**
   - Use Quill or TinyMCE for feedback
   - Support formatting, links, images

6. **Rubric System**
   - Define grading rubrics
   - Criteria-based scoring
   - Auto-calculate total score

## 📝 API Endpoints Summary

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/assignments/submit` | Student | Submit assignment |
| GET | `/api/assignments/submission/:lessonId` | Student | Get own submission |
| POST | `/api/assignments/grade` | Instructor | Grade submission |
| GET | `/api/assignments/lesson/:lessonId/submissions` | Instructor | List all submissions |
| GET | `/api/instructor/courses/:courseId/moocs` | Instructor | List MOOCs |
| POST | `/api/instructor/courses/:courseId/moocs` | Instructor | Create MOOC |
| PUT | `/api/instructor/moocs/:moocId` | Instructor | Update MOOC |
| DELETE | `/api/instructor/moocs/:moocId` | Instructor | Delete MOOC |
| GET | `/api/instructor/courses/:courseId/lessons` | Instructor | List lessons |
| POST | `/api/instructor/lessons` | Instructor | Create lesson |
| PUT | `/api/instructor/lessons/:lessonId` | Instructor | Update lesson |
| DELETE | `/api/instructor/lessons/:lessonId` | Instructor | Delete lesson |
| GET | `/api/instructor/courses/:courseId/students` | Instructor | List students |

## ✨ Success Criteria

- [x] Student can submit assignments (text + file)
- [x] Instructor can view all submissions
- [x] Instructor can grade with score (0-100) and feedback
- [x] Student can view graded results
- [x] Instructor can create/edit/delete MOOCs
- [x] Instructor can create/edit/delete lessons
- [x] All routes protected with role-based auth
- [x] UI responsive and user-friendly
- [x] Database transactions atomic and safe
