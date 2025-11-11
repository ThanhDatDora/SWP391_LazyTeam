# End-to-end exam flow test script
$ErrorActionPreference = "Continue"
$base = 'http://localhost:3001/api'
$examId = 53

Write-Host "=== Starting E2E Exam Test ===" -ForegroundColor Cyan
Write-Host "Base URL: $base" -ForegroundColor Gray
Write-Host "Exam ID: $examId" -ForegroundColor Gray
Write-Host ""

try {
    # Step 1: Start exam
    Write-Host "Step 1: Starting exam..." -ForegroundColor Yellow
    $startResponse = Invoke-RestMethod -Method Post -Uri "$base/learning/exams/$examId/start" -ContentType 'application/json' -ErrorAction Stop
    
    Write-Host "--- START RESPONSE ---" -ForegroundColor Green
    $startResponse | ConvertTo-Json -Depth 10
    Write-Host ""
    
    $attemptId = $startResponse.data.attempt_id
    $questions = $startResponse.data.questions
    
    if (-not $attemptId) {
        Write-Host "ERROR: No attempt_id returned" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Attempt ID: $attemptId" -ForegroundColor Cyan
    Write-Host "Questions count: $($questions.Count)" -ForegroundColor Cyan
    Write-Host ""
    
    # Step 2: Prepare answers (select first option for each question)
    Write-Host "Step 2: Preparing answers (auto-select first option)..." -ForegroundColor Yellow
    $answers = @()
    foreach ($q in $questions) {
        $answers += @{
            question_id = $q.question_id
            selected_option = $q.options[0].label
        }
    }
    
    Write-Host "Prepared $($answers.Count) answers" -ForegroundColor Cyan
    Write-Host ""
    
    # Step 3: Submit exam
    Write-Host "Step 3: Submitting exam..." -ForegroundColor Yellow
    $submitBody = @{
        attempt_id = [int]$attemptId
        answers = $answers
    } | ConvertTo-Json -Depth 10
    
    $submitResponse = Invoke-RestMethod -Method Post -Uri "$base/learning/exams/$examId/submit" -Body $submitBody -ContentType 'application/json' -ErrorAction Stop
    
    Write-Host "--- SUBMIT RESPONSE ---" -ForegroundColor Green
    $submitResponse | ConvertTo-Json -Depth 10
    Write-Host ""
    
    $resultAttemptId = $submitResponse.data.attempt_id
    
    # Step 4: Fetch result
    Write-Host "Step 4: Fetching exam result..." -ForegroundColor Yellow
    $resultResponse = Invoke-RestMethod -Method Get -Uri "$base/learning/exams/attempts/$resultAttemptId/result" -ContentType 'application/json' -ErrorAction Stop
    
    Write-Host "--- RESULT RESPONSE ---" -ForegroundColor Green
    $resultResponse | ConvertTo-Json -Depth 10
    Write-Host ""
    
    # Summary
    Write-Host "=== TEST SUMMARY ===" -ForegroundColor Cyan
    Write-Host "Attempt ID: $resultAttemptId" -ForegroundColor White
    Write-Host "Score: $($submitResponse.data.score)" -ForegroundColor White
    Write-Host "Correct: $($submitResponse.data.correct_answers)/$($submitResponse.data.total_questions)" -ForegroundColor White
    Write-Host "Passed: $($submitResponse.data.passed)" -ForegroundColor White
    Write-Host ""
    Write-Host "=== TEST COMPLETED SUCCESSFULLY ===" -ForegroundColor Green
    
} catch {
    Write-Host "=== ERROR ===" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Response (if any):" -ForegroundColor Yellow
    if ($_.ErrorDetails.Message) {
        $_.ErrorDetails.Message
    }
    Write-Host ""
    Write-Host "=== TEST FAILED ===" -ForegroundColor Red
    exit 1
}
