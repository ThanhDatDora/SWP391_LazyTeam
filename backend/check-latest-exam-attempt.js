import { getPool } from './config/database.js';

async function checkLatestExamAttempt() {
    const pool = await getPool();
    try {
        // Check latest exam attempts
        const attemptsQuery = `
            SELECT TOP 5
                ea.attempt_id,
                ea.user_id,
                u.email,
                u.full_name,
                ea.mooc_id,
                ea.started_at,
                ea.submitted_at,
                ea.time_taken,
                ea.total_questions,
                ea.correct_answers,
                ea.score,
                ea.passed,
                ea.answers
            FROM exam_attempts ea
            JOIN users u ON ea.user_id = u.user_id
            WHERE ea.mooc_id = 53
            ORDER BY ea.started_at DESC
        `;
        
        const attemptsResult = await pool.request().query(attemptsQuery);
        
        console.log('=== LATEST EXAM ATTEMPTS FOR MOOC 53 ===');
        attemptsResult.recordset.forEach(attempt => {
            console.log(`📋 Attempt ID: ${attempt.attempt_id}`);
            console.log(`👤 User: ${attempt.full_name} (${attempt.email})`);
            console.log(`📅 Started: ${attempt.started_at}`);
            console.log(`✅ Submitted: ${attempt.submitted_at || 'NOT SUBMITTED'}`);
            console.log(`⏱️ Time taken: ${attempt.time_taken || 'N/A'} seconds`);
            console.log(`📊 Score: ${attempt.score || 'NO SCORE'}/${attempt.total_questions || 0}`);
            console.log(`📝 Correct: ${attempt.correct_answers || 0}/${attempt.total_questions || 0}`);
            console.log(`✅ Passed: ${attempt.passed ? 'YES' : 'NO'}`);
            if (attempt.answers) {
                try {
                    const answers = JSON.parse(attempt.answers);
                    console.log(`📝 Answers: ${answers.length} questions answered`);
                } catch (e) {
                    console.log(`📝 Answers: ${attempt.answers}`);
                }
            }
            console.log('---');
        });
        
        // Check if we have exam submit API route
        console.log('\n=== CHECKING SUBMIT FUNCTIONALITY ===');
        console.log('Need to check if exam submit API exists and works properly');
        console.log('Also need to implement exam results page to show score/pass/fail');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.close();
    }
}

checkLatestExamAttempt();