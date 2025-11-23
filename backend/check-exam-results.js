import { getPool } from './config/database.js';

async function checkExamResults() {
    const pool = await getPool();
    try {
        // Check exam attempts with details
        const attemptsQuery = `
            SELECT 
                ea.attempt_id,
                ea.user_id,
                u.email,
                u.full_name,
                ea.exam_id,
                ea.started_at,
                ea.completed_at,
                ea.score,
                ea.total_questions,
                ea.correct_answers,
                ea.status,
                DATEDIFF(MINUTE, ea.started_at, GETDATE()) as minutes_ago
            FROM exam_attempts ea
            JOIN users u ON ea.user_id = u.user_id
            WHERE ea.exam_id = 53
            ORDER BY ea.started_at DESC
        `;
        
        const attemptsResult = await pool.request().query(attemptsQuery);
        
        console.log('=== EXAM ATTEMPTS FOR MOOC 53 ===');
        if (attemptsResult.recordset.length === 0) {
            console.log('❌ No exam attempts found');
        } else {
            attemptsResult.recordset.forEach(attempt => {
                console.log(`📋 Attempt ID: ${attempt.attempt_id}`);
                console.log(`👤 User: ${attempt.full_name} (${attempt.email})`);
                console.log(`📅 Started: ${attempt.started_at}`);
                console.log(`✅ Completed: ${attempt.completed_at || 'NOT COMPLETED'}`);
                console.log(`📊 Score: ${attempt.score || 'NO SCORE'}`);
                console.log(`📝 Questions: ${attempt.correct_answers || 0}/${attempt.total_questions || 0}`);
                console.log(`📈 Status: ${attempt.status}`);
                console.log(`⏰ ${attempt.minutes_ago} minutes ago`);
                console.log('---');
            });
        }
        
        // Check if there are any submission/answer records
        const submissionsQuery = `
            SELECT 
                es.submission_id,
                es.attempt_id,
                es.question_id,
                es.selected_option,
                es.is_correct,
                es.submitted_at,
                q.question_text,
                q.correct_answer
            FROM exam_submissions es
            JOIN exam_attempts ea ON es.attempt_id = ea.attempt_id
            JOIN questions q ON es.question_id = q.question_id
            WHERE ea.exam_id = 53
            ORDER BY es.attempt_id DESC, es.question_id
        `;
        
        const submissionsResult = await pool.request().query(submissionsQuery);
        
        console.log('\n=== EXAM SUBMISSIONS FOR MOOC 53 ===');
        if (submissionsResult.recordset.length === 0) {
            console.log('❌ No exam submissions found');
        } else {
            console.log(`✅ Found ${submissionsResult.recordset.length} submissions`);
            submissionsResult.recordset.forEach(sub => {
                console.log(`📝 Q${sub.question_id}: ${sub.selected_option} ${sub.is_correct ? '✅' : '❌'} (Correct: ${sub.correct_answer})`);
            });
        }
        
        // Check cooldown policy
        const cooldownQuery = `
            SELECT 
                ea.user_id,
                COUNT(*) as attempt_count,
                MAX(ea.started_at) as last_attempt,
                DATEDIFF(SECOND, MAX(ea.started_at), GETDATE()) as seconds_since_last
            FROM exam_attempts ea
            WHERE ea.exam_id = 53 
            AND ea.started_at > DATEADD(HOUR, -24, GETDATE())
            GROUP BY ea.user_id
        `;
        
        const cooldownResult = await pool.request().query(cooldownQuery);
        
        console.log('\n=== 24H COOLDOWN STATUS ===');
        if (cooldownResult.recordset.length === 0) {
            console.log('✅ No recent attempts - all users can take exam');
        } else {
            cooldownResult.recordset.forEach(cd => {
                const canRetake = cd.seconds_since_last > 86400; // 24 hours
                console.log(`👤 User ${cd.user_id}: ${cd.attempt_count} attempts, last: ${cd.last_attempt}`);
                console.log(`⏰ Seconds since last: ${cd.seconds_since_last} (${canRetake ? 'CAN RETAKE' : 'MUST WAIT'})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error checking exam results:', error);
    } finally {
        await pool.close();
    }
}

checkExamResults();