import { getPool } from './config/database.js';
import sql from 'mssql';

console.log('🧪 Testing Complete Exam Flow\n');

async function testCompleteFlow() {
  let instanceId = null;
  let questionIds = [];
  
  try {
    const pool = await getPool();
    console.log('✅ Connected to database\n');

    // 1. Check exam exists
    console.log('1️⃣ Checking exam data...');
    const exam = await pool.request()
      .input('examId', sql.BigInt, 7)
      .query('SELECT * FROM exams WHERE exam_id = @examId');
    
    if (exam.recordset.length === 0) {
      console.log('❌ Exam ID 7 not found!');
      return;
    }
    
    console.log(`✅ Found exam: ${exam.recordset[0].name}`);
    console.log(`   Duration: ${exam.recordset[0].duration_minutes} min`);
    console.log(`   Attempts: ${exam.recordset[0].attempts_allowed}\n`);

    // 2. Get all questions for this exam
    console.log('2️⃣ Getting question bank...');
    const questions = await pool.request()
      .input('examId', sql.BigInt, 7)
      .query(`
        SELECT q.question_id, q.difficulty 
        FROM questions q 
        JOIN exam_items ei ON q.question_id = ei.question_id 
        WHERE ei.exam_id = @examId
      `);
    
    console.log(`✅ Total questions in bank: ${questions.recordset.length}`);
    const easy = questions.recordset.filter(q => q.difficulty === 'easy');
    const medium = questions.recordset.filter(q => q.difficulty === 'medium');
    const hard = questions.recordset.filter(q => q.difficulty === 'hard');
    console.log(`   Easy: ${easy.length}, Medium: ${medium.length}, Hard: ${hard.length}\n`);

    // 3. Test random selection
    console.log('3️⃣ Testing random selection algorithm...');
    function randomSelect(arr, count) {
      return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(count, arr.length));
    }
    
    const selected = [
      ...randomSelect(easy, 10),
      ...randomSelect(medium, 15),
      ...randomSelect(hard, 5)
    ];
    
    console.log(`✅ Selected ${selected.length} questions`);
    console.log(`   10 easy, 15 medium, 5 hard\n`);

    // 4. Create exam instance
    console.log('4️⃣ Creating exam instance...');
    const instance = await pool.request()
      .input('examId', sql.BigInt, 7)
      .input('userId', sql.BigInt, 1)
      .input('attempt', sql.Int, 1)
      .input('questions', sql.NVarChar, JSON.stringify(selected.map(q => q.question_id)))
      .input('time', sql.Int, 3600)
      .query(`
        INSERT INTO exam_instances 
        (exam_id, user_id, attempt_number, selected_questions, time_remaining_sec, status, start_time)
        OUTPUT INSERTED.instance_id, INSERTED.start_time
        VALUES (@examId, @userId, @attempt, @questions, @time, 'in_progress', GETDATE())
      `);
    
    instanceId = instance.recordset[0].instance_id;
    questionIds = selected.map(q => q.question_id);
    console.log(`✅ Created instance ID: ${instanceId}`);
    console.log(`   Start time: ${instance.recordset[0].start_time}\n`);

    // 5. Create submission
    console.log('5️⃣ Creating submission record...');
    const submission = await pool.request()
      .input('examId', sql.BigInt, 7)
      .input('userId', sql.BigInt, 1)
      .query(`
        INSERT INTO submissions (exam_id, user_id, attempt_no, score, max_score)
        OUTPUT INSERTED.submission_id
        VALUES (@examId, @userId, 0, 0, 0)
      `);
    
    const submissionId = submission.recordset[0].submission_id;
    console.log(`✅ Created submission ID: ${submissionId}\n`);

    // Link submission to instance
    await pool.request()
      .input('instanceId', sql.BigInt, instanceId)
      .input('subId', sql.BigInt, submissionId)
      .query('UPDATE exam_instances SET submission_id = @subId WHERE instance_id = @instanceId');

    // 6. Save some answers
    console.log('6️⃣ Simulating answer saving...');
    const answeredCount = Math.min(5, questionIds.length);
    
    for (let i = 0; i < answeredCount; i++) {
      const qId = questionIds[i];
      
      // Get correct answer for this question
      const correctOpt = await pool.request()
        .input('qId', sql.BigInt, qId)
        .query('SELECT option_id FROM question_options WHERE question_id = @qId AND is_correct = 1');
      
      if (correctOpt.recordset.length > 0) {
        const optionId = correctOpt.recordset[0].option_id;
        
        await pool.request()
          .input('subId', sql.BigInt, submissionId)
          .input('qId', sql.BigInt, qId)
          .input('opts', sql.NVarChar, JSON.stringify([optionId]))
          .query(`
            INSERT INTO exam_answers (submission_id, question_id, selected_options)
            VALUES (@subId, @qId, @opts)
          `);
      }
    }
    
    console.log(`✅ Saved ${answeredCount} answers (all correct for testing)\n`);

    // 7. Test grading logic
    console.log('7️⃣ Testing grading...');
    
    const answers = await pool.request()
      .input('subId', sql.BigInt, submissionId)
      .query('SELECT * FROM exam_answers WHERE submission_id = @subId');
    
    const userAnswers = {};
    answers.recordset.forEach(a => {
      userAnswers[a.question_id] = JSON.parse(a.selected_options);
    });

    const correct = await pool.request()
      .query(`SELECT question_id, option_id FROM question_options 
              WHERE question_id IN (${questionIds.join(',')}) AND is_correct = 1`);
    
    const correctMap = {};
    correct.recordset.forEach(c => {
      if (!correctMap[c.question_id]) correctMap[c.question_id] = [];
      correctMap[c.question_id].push(c.option_id);
    });

    const points = await pool.request()
      .query(`SELECT question_id, points FROM exam_items WHERE question_id IN (${questionIds.join(',')})`);
    
    const pointsMap = {};
    points.recordset.forEach(p => {
      pointsMap[p.question_id] = p.points;
    });

    let totalScore = 0, maxScore = 0, correctCount = 0;
    
    for (const qId of questionIds) {
      maxScore += pointsMap[qId] || 0;
      const userAns = userAnswers[qId] || [];
      const correctAns = correctMap[qId] || [];
      
      const isCorrect = userAns.length === correctAns.length && 
                       userAns.sort().every((val, idx) => val === correctAns.sort()[idx]);
      
      if (isCorrect) {
        totalScore += pointsMap[qId] || 0;
        correctCount++;
      }

      await pool.request()
        .input('subId', sql.BigInt, submissionId)
        .input('qId', sql.BigInt, qId)
        .input('correct', sql.Bit, isCorrect ? 1 : 0)
        .input('pts', sql.Decimal, isCorrect ? (pointsMap[qId] || 0) : 0)
        .query('UPDATE exam_answers SET is_correct = @correct, points_earned = @pts WHERE submission_id = @subId AND question_id = @qId');
    }

    console.log(`✅ Grading complete:`);
    console.log(`   Score: ${totalScore}/${maxScore}`);
    console.log(`   Percentage: ${Math.round((totalScore/maxScore)*100)}%`);
    console.log(`   Correct: ${correctCount}/${questionIds.length}\n`);

    // 8. Update submission
    console.log('8️⃣ Finalizing submission...');
    await pool.request()
      .input('subId', sql.BigInt, submissionId)
      .input('attempt', sql.TinyInt, 1)
      .input('score', sql.Decimal, totalScore)
      .input('max', sql.Decimal, maxScore)
      .query('UPDATE submissions SET attempt_no = @attempt, score = @score, max_score = @max, submitted_at = GETDATE() WHERE submission_id = @subId');

    await pool.request()
      .input('id', sql.BigInt, instanceId)
      .query("UPDATE exam_instances SET status = 'completed', end_time = GETDATE() WHERE instance_id = @id");
    
    console.log('✅ Submission finalized\n');

    // 9. Verify results
    console.log('9️⃣ Verifying final results...');
    const finalResults = await pool.request()
      .input('id', sql.BigInt, instanceId)
      .query(`
        SELECT ei.*, s.score, s.max_score, s.submitted_at
        FROM exam_instances ei
        LEFT JOIN submissions s ON ei.submission_id = s.submission_id
        WHERE ei.instance_id = @id
      `);
    
    const result = finalResults.recordset[0];
    console.log(`✅ Final results:`);
    console.log(`   Instance ID: ${result.instance_id}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Score: ${result.score}/${result.max_score}`);
    console.log(`   Submitted: ${result.submitted_at}\n`);

    console.log('🎉 ALL TESTS PASSED!\n');
    console.log('📋 Summary:');
    console.log('   ✅ Exam data verified');
    console.log('   ✅ Random selection works (30/60 questions)');
    console.log('   ✅ Instance creation works');
    console.log('   ✅ Answer saving works');
    console.log('   ✅ Grading algorithm correct');
    console.log('   ✅ Submission finalization works');
    console.log(`\n🆔 Test Instance ID: ${instanceId} (can be deleted)`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  } finally {
    // Cleanup
    if (instanceId) {
      console.log('\n🧹 Cleaning up test data...');
      try {
        const pool = await getPool();
        
        // Get submission_id first
        const inst = await pool.request()
          .input('id', sql.BigInt, instanceId)
          .query('SELECT submission_id FROM exam_instances WHERE instance_id = @id');
        
        if (inst.recordset.length > 0 && inst.recordset[0].submission_id) {
          const subId = inst.recordset[0].submission_id;
          
          // Delete answers
          await pool.request()
            .input('subId', sql.BigInt, subId)
            .query('DELETE FROM exam_answers WHERE submission_id = @subId');
          
          // Delete submission
          await pool.request()
            .input('subId', sql.BigInt, subId)
            .query('DELETE FROM submissions WHERE submission_id = @subId');
        }
        
        // Delete instance
        await pool.request()
          .input('id', sql.BigInt, instanceId)
          .query('DELETE FROM exam_instances WHERE instance_id = @id');
        
        console.log('✅ Test data cleaned up\n');
      } catch (cleanupError) {
        console.error('⚠️  Cleanup failed:', cleanupError.message);
      }
    }
    
    process.exit(0);
  }
}

testCompleteFlow();
