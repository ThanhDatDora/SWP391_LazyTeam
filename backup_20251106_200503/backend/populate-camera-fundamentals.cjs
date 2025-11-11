const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary', 
  user: 'sa',
  password: '123456',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// Camera Fundamentals questions for Course 9
const cameraQuestions = [
  {
    question_text: 'What does ISO control in photography?',
    question_type: 'mcq',
    difficulty_level: 'easy',
    max_score: 1.0,
    answers: [
      { answer_text: 'Camera sensitivity to light', is_correct: 1 },
      { answer_text: 'Shutter speed', is_correct: 0 },
      { answer_text: 'Aperture size', is_correct: 0 },
      { answer_text: 'Focus distance', is_correct: 0 }
    ]
  },
  {
    question_text: 'What is the exposure triangle in photography?',
    question_type: 'mcq',
    difficulty_level: 'medium',
    max_score: 1.0,
    answers: [
      { answer_text: 'ISO, Aperture, Shutter Speed', is_correct: 1 },
      { answer_text: 'ISO, Focus, White Balance', is_correct: 0 },
      { answer_text: 'Aperture, Focus, Zoom', is_correct: 0 },
      { answer_text: 'Shutter Speed, Flash, ISO', is_correct: 0 }
    ]
  },
  {
    question_text: 'What does f/2.8 represent in camera settings?',
    question_type: 'mcq',
    difficulty_level: 'medium',
    max_score: 1.0,
    answers: [
      { answer_text: 'Aperture setting', is_correct: 1 },
      { answer_text: 'Shutter speed', is_correct: 0 },
      { answer_text: 'ISO value', is_correct: 0 },
      { answer_text: 'Focal length', is_correct: 0 }
    ]
  },
  {
    question_text: 'Which setting creates a shallow depth of field?',
    question_type: 'mcq',
    difficulty_level: 'medium',
    max_score: 1.0,
    answers: [
      { answer_text: 'Wide aperture (low f-number like f/1.4)', is_correct: 1 },
      { answer_text: 'Narrow aperture (high f-number like f/16)', is_correct: 0 },
      { answer_text: 'High ISO', is_correct: 0 },
      { answer_text: 'Fast shutter speed', is_correct: 0 }
    ]
  },
  {
    question_text: 'What is the rule of thirds in photography?',
    question_type: 'mcq',
    difficulty_level: 'easy',
    max_score: 1.0,
    answers: [
      { answer_text: 'Dividing image into 9 equal sections for composition', is_correct: 1 },
      { answer_text: 'Taking 3 photos of each subject', is_correct: 0 },
      { answer_text: 'Using 3 different camera settings', is_correct: 0 },
      { answer_text: 'Shooting at 3 different times', is_correct: 0 }
    ]
  },
  {
    question_text: 'What does a faster shutter speed do?',
    question_type: 'mcq',
    difficulty_level: 'medium',
    max_score: 1.0,
    answers: [
      { answer_text: 'Freezes motion and reduces motion blur', is_correct: 1 },
      { answer_text: 'Increases depth of field', is_correct: 0 },
      { answer_text: 'Makes image brighter', is_correct: 0 },
      { answer_text: 'Increases ISO automatically', is_correct: 0 }
    ]
  },
  {
    question_text: 'What is white balance in photography?',
    question_type: 'mcq',
    difficulty_level: 'easy',
    max_score: 1.0,
    answers: [
      { answer_text: 'Adjusting colors to match lighting conditions', is_correct: 1 },
      { answer_text: 'Making the background white', is_correct: 0 },
      { answer_text: 'Balancing light and shadow', is_correct: 0 },
      { answer_text: 'Setting exposure to middle gray', is_correct: 0 }
    ]
  },
  {
    question_text: 'What type of lens is best for portraits?',
    question_type: 'mcq',
    difficulty_level: 'medium',
    max_score: 1.0,
    answers: [
      { answer_text: '85mm-135mm telephoto lens', is_correct: 1 },
      { answer_text: '14mm wide-angle lens', is_correct: 0 },
      { answer_text: '300mm super telephoto', is_correct: 0 },
      { answer_text: 'Fish-eye lens', is_correct: 0 }
    ]
  },
  {
    question_text: 'What is the golden hour in photography?',
    question_type: 'mcq',
    difficulty_level: 'easy',
    max_score: 1.0,
    answers: [
      { answer_text: 'Hour after sunrise and before sunset with warm light', is_correct: 1 },
      { answer_text: 'Exactly at noon with bright light', is_correct: 0 },
      { answer_text: 'Any hour with yellow lighting', is_correct: 0 },
      { answer_text: 'One hour of shooting time', is_correct: 0 }
    ]
  },
  {
    question_text: 'What does manual focus mode allow you to do?',
    question_type: 'mcq',
    difficulty_level: 'easy',
    max_score: 1.0,
    answers: [
      { answer_text: 'Manually control which part of image is in focus', is_correct: 1 },
      { answer_text: 'Manually set ISO value', is_correct: 0 },
      { answer_text: 'Manually adjust white balance', is_correct: 0 },
      { answer_text: 'Manually control flash power', is_correct: 0 }
    ]
  }
];

async function populateCameraQuestions() {
  let pool;
  try {
    pool = await sql.connect(config);
    console.log('🔗 Connected to database');

    // Step 1: Find all MOOCs for Course 9 (Photography)
    console.log('\n🔍 STEP 1: Finding Course 9 MOOCs...');
    const moocsResult = await pool.request().query(`
      SELECT mooc_id, title, course_id 
      FROM moocs 
      WHERE course_id = 9
      ORDER BY mooc_id
    `);
    
    console.log(`Found ${moocsResult.recordset.length} MOOCs for Course 9:`);
    moocsResult.recordset.forEach(mooc => {
      console.log(`- MOOC ${mooc.mooc_id}: ${mooc.title}`);
    });

    // Step 2: Find exams for these MOOCs  
    console.log('\n🎯 STEP 2: Finding exams...');
    const examsResult = await pool.request().query(`
      SELECT e.exam_id, e.mooc_id, m.title as mooc_title
      FROM exams e
      JOIN moocs m ON e.mooc_id = m.mooc_id
      WHERE m.course_id = 9
      ORDER BY e.mooc_id
    `);
    
    console.log(`Found ${examsResult.recordset.length} exams:`);
    examsResult.recordset.forEach(exam => {
      console.log(`- Exam ${exam.exam_id} for MOOC ${exam.mooc_id}: ${exam.mooc_title}`);
    });

    // Step 3: Focus on Camera Fundamentals (should be one of them)
    const cameraExam = examsResult.recordset.find(exam => 
      exam.mooc_title.toLowerCase().includes('camera') || 
      exam.mooc_title.toLowerCase().includes('fundamental')
    );

    if (!cameraExam) {
      console.log('❌ Camera Fundamentals exam not found!');
      console.log('Available exams:', examsResult.recordset.map(e => e.mooc_title));
      return;
    }

    console.log(`\n📷 STEP 3: Working with Camera Fundamentals...`);
    console.log(`Target: Exam ${cameraExam.exam_id} - ${cameraExam.mooc_title}`);

    // Step 4: Clear existing questions for this MOOC (not exam_id)
    console.log('\n🧹 STEP 4: Clearing existing questions...');
    
    const deleteResult = await pool.request()
      .input('moocId', sql.BigInt, cameraExam.mooc_id)
      .query('DELETE FROM questions WHERE mooc_id = @moocId');
    
    console.log(`Cleared ${deleteResult.rowsAffected[0]} existing questions`);

    // Step 5: Insert new questions into questions table
    console.log('\n➕ STEP 5: Adding new questions...');
    
    for (let i = 0; i < cameraQuestions.length; i++) {
      const question = cameraQuestions[i];
      
      // Insert question into questions table
      const questionResult = await pool.request()
        .input('moocId', sql.BigInt, cameraExam.mooc_id)
        .input('stem', sql.NVarChar(sql.MAX), question.question_text)
        .input('qtype', sql.VarChar(50), 'mcq') // Use 'mcq' instead of 'multiple_choice'
        .input('difficulty', sql.VarChar(50), question.difficulty_level)
        .input('maxScore', sql.Decimal(5,2), question.max_score)
        .input('createdBy', sql.BigInt, 1)
        .query(`
          INSERT INTO questions (mooc_id, stem, qtype, difficulty, max_score, created_by, created_at)
          OUTPUT INSERTED.question_id
          VALUES (@moocId, @stem, @qtype, @difficulty, @maxScore, @createdBy, GETDATE())
        `);
      
      const questionId = questionResult.recordset[0].question_id;
      console.log(`  ✅ Q${i+1}: ${question.question_text.substring(0, 50)}...`);

      // Insert answers into question_options table
      for (let j = 0; j < question.answers.length; j++) {
        const answer = question.answers[j];
        
        await pool.request()
          .input('questionId', sql.BigInt, questionId)
          .input('label', sql.NVarChar, String.fromCharCode(65 + j)) // A, B, C, D
          .input('content', sql.NVarChar(sql.MAX), answer.answer_text)
          .input('isCorrect', sql.Bit, answer.is_correct)
          .query(`
            INSERT INTO question_options (question_id, label, content, is_correct)
            VALUES (@questionId, @label, @content, @isCorrect)
          `);
      }
    }

    // Step 6: Verify results
    console.log('\n✅ STEP 6: Verification...');
    
    const verifyResult = await pool.request()
      .input('moocId', sql.BigInt, cameraExam.mooc_id)
      .query(`
        SELECT COUNT(*) as question_count
        FROM questions 
        WHERE mooc_id = @moocId
      `);
    
    const questionCount = verifyResult.recordset[0].question_count;
    console.log(`📊 Total questions for MOOC ${cameraExam.mooc_id}: ${questionCount}`);

    // Test API query - this should match API route logic
    console.log('\n🔍 STEP 7: Testing API query...');
    const apiTestResult = await pool.request()
      .input('moocId', sql.BigInt, cameraExam.mooc_id)
      .query(`
        SELECT COUNT(q.question_id) as total 
        FROM questions q
        WHERE q.mooc_id = @moocId
      `);
    
    console.log(`🎯 API query result for MOOC ${cameraExam.mooc_id}: ${apiTestResult.recordset[0].total} questions`);

    console.log('\n🎉 SUCCESS! Camera Fundamentals exam populated successfully!');
    console.log(`📋 Summary:`);
    console.log(`   - Exam ID: ${cameraExam.exam_id}`);
    console.log(`   - MOOC ID: ${cameraExam.mooc_id}`);
    console.log(`   - Questions: ${questionCount}`);
    console.log(`   - API ready: ${apiTestResult.recordset[0].total > 0 ? 'YES' : 'NO'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

populateCameraQuestions();