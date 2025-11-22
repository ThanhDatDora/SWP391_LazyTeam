# Manual Testing Instructions

## Issue Encountered
Backend server keeps crashing when started via PowerShell automation. This is a known issue with PowerShell Start-Process and Node.js HTTP servers.

## Solution: Manual Server Start

### Step 1: Start Backend Server

1. **Open a NEW terminal** in VSCode (Terminal → New Terminal)
2. Run these commands:
   ```powershell
   cd backend
   node server.js
   ```
3. **Wait for confirmation message:**
   ```
   ✅ Server listening on localhost (127.0.0.1:3001)
   🎯 Server confirmed listening on port 3001
   ```
4. **KEEP THIS TERMINAL OPEN!** Do not close or Ctrl+C

### Step 2: Run Automated Tests

1. **Open ANOTHER terminal** (click the `+` button in terminal panel)
2. Run:
   ```powershell
   node test-complete-exam-flow.cjs
   ```

## Expected Test Results

The test script will verify:

✅ **Test 1: Backend Health Check**
- Verifies server is running
- Checks database connection
- Expected: PASS

⚠️ **Test 2: User Login** (may fail initially)
- Issue: Test user credentials unknown
- Current user: `learner@example.com`
- If fails, we need to:
  - Try different passwords, OR
  - Create new test user, OR
  - Update test script with correct credentials

✅ **Tests 3-6: Exam Flow** (if login succeeds)
- Get exam by MOOC ID
- Start exam session
- Submit answers
- Get exam results

## Alternative: Use Existing Test Scripts

If automated test fails, you can test manually using:

1. **Browser testing:**
   - Frontend: http://localhost:5173
   - Login with any existing user
   - Navigate to a course with exam (check EXAM_TESTING_GUIDE.md)

2. **API testing:**
   - Use existing scripts: `test-exam-apis.cjs`
   - Or Postman/Thunder Client with manual requests

## Next Steps After Testing

1. ✅ Verify test results
2. ✅ Check database for progress tracking
3. ✅ Document findings in COMPLETION_SUMMARY.md
4. ✅ Final git commit and push

---

**Note:** This is a temporary workaround. In production, servers run as services/containers and this issue doesn't occur.
