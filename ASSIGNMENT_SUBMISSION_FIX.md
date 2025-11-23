# 🔧 Assignment Submission Error Fix

## Problem
```
POST http://localhost:3001/api/assignments/submit 500 (Internal Server Error)
```

## Root Causes Identified

### 1. Status Value Mismatch
- **Issue**: Backend was hardcoding `status = 'pending'` in INSERT/UPDATE
- **Database**: Sample data shows `status = 'submitted'`
- **Fix**: Changed to use `'submitted'` consistently

### 2. Missing Error Details
- **Issue**: Backend only logged `error` object without details
- **Fix**: Added comprehensive error logging:
  - Error message
  - Stack trace
  - Full error details

## Changes Made

### File: `backend/routes/assignments.js`

**Change 1: INSERT Query (Line ~96)**
```javascript
// BEFORE
VALUES (@taskId, @userId, @contentText, @fileUrl, 'pending', GETDATE())

// AFTER  
.input('status', sql.NVarChar(30), 'submitted')
VALUES (@taskId, @userId, @contentText, @fileUrl, @status, GETDATE())
```

**Change 2: UPDATE Query (Line ~75)**
```javascript
// BEFORE
SET content_text = @contentText,
    file_url = COALESCE(@fileUrl, file_url),
    status = 'pending',
    submitted_at = GETDATE()

// AFTER
.input('status', sql.NVarChar(30), 'submitted')
SET content_text = @contentText,
    file_url = COALESCE(@fileUrl, file_url),
    status = @status,
    submitted_at = GETDATE()
```

**Change 3: Response (Line ~140)**
```javascript
// BEFORE
data: {
  submission_id: submissionId,
  status: 'pending'
}

// AFTER
data: {
  submission_id: submissionId,
  status: 'submitted'
}
```

**Change 4: Error Logging (Line ~147)**
```javascript
// BEFORE
console.error('❌ Error submitting assignment:', error);

// AFTER
console.error('❌ Error submitting assignment:');
console.error('   Message:', error.message);
console.error('   Stack:', error.stack);
console.error('   Details:', error);
```

## Testing Steps

### 1. Restart Backend Server
```powershell
# Stop current backend (Ctrl+C if running)
# Start fresh
cd backend
npm run dev
```

### 2. Test Submission from UI
1. Login as student
2. Navigate to any assignment lesson
3. Enter text content: "This is my assignment submission"
4. Click "Nộp bài" button
5. Should see success message

### 3. Verify in Database
```sql
SELECT TOP 5 
  essay_submission_id,
  user_id,
  task_id,
  status,
  submitted_at,
  content_text
FROM essay_submissions
ORDER BY submitted_at DESC;
```

Expected result:
- Status = 'submitted'
- submitted_at = current timestamp
- content_text = your text

### 4. Check Backend Logs
If still failing, backend console should now show:
```
❌ Error submitting assignment:
   Message: [detailed error message]
   Stack: [full stack trace]
   Details: [error object]
```

## Status Values in System

After analyzing the database:
- **`submitted`**: Student has submitted, not yet graded
- **`graded`**: Instructor has graded the submission
- **`pending`**: (Not used - removed)

## Instructor Grading Impact

### Before
- Instructor sees submissions with `status = 'pending'`

### After  
- Instructor sees submissions with `status = 'submitted'`
- Need to update filter in instructor UI

## UI Updates Needed

### File: `src/pages/instructor/AssignmentGrading.jsx`
Update status badge mapping:
```javascript
const getStatusBadge = (status) => {
  switch (status) {
    case 'graded':
      return <Badge variant="default"><CheckCircle /> Đã chấm</Badge>;
    case 'submitted':  // Changed from 'pending'
      return <Badge variant="secondary"><Clock /> Chờ chấm</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
```

### File: `src/pages/instructor/InstructorCourseManagement.jsx`
Update submission filter:
```javascript
// Line ~605 (approximately)
assignments.filter(a => a.status === 'submitted').length  // Changed from 'pending'
```

## Quick Verification

Run verification script to check current submissions:
```powershell
cd backend
node verify-assignment-system.mjs
```

Look for section:
```
📝 Assignment Submissions:
1. [Student Name]
   Status: submitted   # Should be 'submitted' not 'pending'
```

## If Still Failing

### Check 1: Database Connection
```powershell
cd backend
node check-essay-submissions-schema.mjs
```

### Check 2: Multer Upload Folder
```powershell
# From backend directory
if (!(Test-Path "uploads/assignments")) {
  New-Item -ItemType Directory -Path "uploads/assignments"
}
```

### Check 3: Authentication
- Check browser console for token
- Verify `Authorization: Bearer [token]` header present

### Check 4: FormData
- Open browser DevTools → Network
- Click on failed `/api/assignments/submit` request
- Check "Payload" tab
- Should see:
  - `lesson_id`: [number]
  - `content_text`: [your text]
  - `file`: [optional]

## Related Files

- `backend/routes/assignments.js` - Main submission logic
- `src/services/api.js` - Frontend API call
- `src/components/learning/AssignmentLesson.jsx` - Submission UI
- `src/pages/instructor/AssignmentGrading.jsx` - Grading UI

## Next Steps After Fix

1. ✅ Test student submission
2. ✅ Verify database update
3. ✅ Update instructor UI to use 'submitted' instead of 'pending'
4. ✅ Test instructor grading workflow
5. ✅ Update verification script if needed

## Summary

**Problem**: 500 error on assignment submission  
**Root Cause**: Status value inconsistency ('pending' vs 'submitted')  
**Solution**: Standardize on 'submitted' status  
**Impact**: Need to update instructor UI filters  
**Status**: Fixed - ready for testing
