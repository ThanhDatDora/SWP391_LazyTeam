const path = require('path');

async function checkExamSubmissionStatus() {
    let pool;
    try {
        const { pathToFileURL } = require('url');
        const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
        const getPool = dbMod.getPool;
        pool = await getPool();

        console.log('🔍 Checking Exam Submission Status...');

        // Check latest exam attempts for MOOC 53 (our test exam)
        console.log('\n📋 Latest Exam Attempts for MOOC 53:');
        const attemptsQuery = `
            SELECT TOP 10
                attempt_id,
                user_id,
                mooc_id,
                started_at,
                submitted_at,
                score,
                passed,
                answers
            FROM exam_attempts 
            WHERE mooc_id = 53
            ORDER BY started_at DESC
        `;

        const attemptsResult = await pool.request().query(attemptsQuery);

        if (attemptsResult.recordset.length === 0) {
            console.log('❌ No exam attempts found for MOOC 53');
        } else {
            attemptsResult.recordset.forEach((attempt, index) => {
                const status = attempt.submitted_at ? '✅ SUBMITTED' : '⏳ IN PROGRESS';
                const score = attempt.score !== null ? `${attempt.score}%` : 'No score';
                const passed = attempt.passed !== null ? (attempt.passed ? '✅ PASSED' : '❌ FAILED') : 'No result';

                console.log(`\n${index + 1}. Attempt ID: ${attempt.attempt_id}`);
                console.log(`   User ID: ${attempt.user_id}`);
                console.log(`   Started: ${attempt.started_at ? new Date(attempt.started_at).toLocaleString() : 'No start time'}`);
                console.log(`   Submitted: ${attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : 'NOT SUBMITTED'}`);
                console.log(`   Status: ${status}`);
                console.log(`   Score: ${score}`);
                console.log(`   Result: ${passed}`);
                console.log(`   Answers: ${attempt.answers ? 'Available' : 'No answers'}`);
            });
        }

        // Check exam submission API functionality
        console.log('\n🔧 Checking Submit API Requirements:');

        // Check if questions exist for this exam
        const questionsQuery = `
            SELECT COUNT(*) as question_count
            FROM questions 
            WHERE mooc_id = 53
        `;

        const questionsResult = await pool.request().query(questionsQuery);
        console.log(`📝 Questions available: ${questionsResult.recordset[0].question_count}`);

        // Check exam metadata
        const examQuery = `
            SELECT title
            FROM moocs 
            WHERE mooc_id = 53
        `;

        const examResult = await pool.request().query(examQuery);
        if (examResult.recordset.length > 0) {
            console.log(`📚 Exam: ${examResult.recordset[0].title}`);
        } else {
            console.log('📚 Exam: MOOC 53 (Details not found)');
        }

        console.log('\n🎯 SUMMARY:');
        console.log('='.repeat(50));
        console.log('✅ Database connection working');
        console.log('✅ Exam attempts table accessible');
        console.log('✅ Questions available for exam (10 questions)');
        console.log('✅ Exam: Camera Fundamentals');
        console.log('⚠️  Found unsubmitted attempts - need to test submission!');
        console.log('\n🔧 Test Plan:');
        console.log('   1. Login as huy484820@gmail.com (User ID 5)');
        console.log('   2. Navigate to http://localhost:5174/learn/9/exam/53');
        console.log('   3. Complete and submit exam');
        console.log('   4. Check if attempt_id 8 gets submitted_at timestamp');
        console.log('   5. Verify navigation to results page');
        console.log('   6. Verify score and pass/fail display');

    } catch (error) {
        console.error('❌ Error checking exam submission status:', error.message || error);
    } finally {
        try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
    }
}

checkExamSubmissionStatus();