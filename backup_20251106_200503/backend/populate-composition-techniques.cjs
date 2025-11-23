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

// Composition Techniques questions for MOOC 54
const compositionQuestions = [
  {
    question_text: 'What is the rule of thirds in photography?',
    question_type: 'mcq',
    difficulty_level: 'easy',
    max_score: 1.0,
    answers: [
      { answer_text: 'Dividing the frame into 9 equal sections with 2 horizontal and 2 vertical lines', is_correct: 1 },
      { answer_text: 'Taking 3 photos of the same subject', is_correct: 0 },
      { answer_text: 'Using 3 different camera settings', is_correct: 0 },
      { answer_text: 'Shooting at 3 different times of day', is_correct: 0 }
    ]
  },
  {
    question_text: 'What is leading lines composition technique?',
    question_type: 'mcq',
    difficulty_level: 'medium',
    max_score: 1.0,
    answers: [
      { answer_text: 'Using lines to guide viewers eye toward the subject', is_correct: 1 },
      { answer_text: 'Drawing lines on the photo after taking it', is_correct: 0 },
      { answer_text: 'Using only straight lines in photography', is_correct: 0 },
      { answer_text: 'Leading the subject to different positions', is_correct: 0 }
    ]
  },
  {
    question_text: 'What does framing mean in photography composition?',
    question_type: 'mcq',
    difficulty_level: 'medium',
    max_score: 1.0,
    answers: [
      { answer_text: 'Using elements in the scene to create a border around the subject', is_correct: 1 },
      { answer_text: 'Putting the photo in a physical frame', is_correct: 0 },
      { answer_text: 'Taking photos only in landscape orientation', is_correct: 0 },
      { answer_text: 'Using the camera viewfinder', is_correct: 0 }
    ]
  },
  {
    question_text: 'What is negative space in composition?',
    question_type: 'mcq',
    difficulty_level: 'medium',
    max_score: 1.0,
    answers: [
      { answer_text: 'Empty or unoccupied areas around the main subject', is_correct: 1 },
      { answer_text: 'Dark areas in the photograph', is_correct: 0 },
      { answer_text: 'Areas that are out of focus', is_correct: 0 },
      { answer_text: 'Bad parts of the composition', is_correct: 0 }
    ]
  },
  {
    question_text: 'What is symmetry in photography composition?',
    question_type: 'mcq',
    difficulty_level: 'easy',
    max_score: 1.0,
    answers: [
      { answer_text: 'Balance created when both sides of an image are equal', is_correct: 1 },
      { answer_text: 'Using the same camera settings for all photos', is_correct: 0 },
      { answer_text: 'Taking photos from the same distance', is_correct: 0 },
      { answer_text: 'Using symmetrical camera lenses', is_correct: 0 }
    ]
  },
  {
    question_text: 'What is the purpose of using patterns in composition?',
    question_type: 'mcq',
    difficulty_level: 'medium',
    max_score: 1.0,
    answers: [
      { answer_text: 'To create visual rhythm and interest in the image', is_correct: 1 },
      { answer_text: 'To make the photo technically perfect', is_correct: 0 },
      { answer_text: 'To increase camera shutter speed', is_correct: 0 },
      { answer_text: 'To reduce file size', is_correct: 0 }
    ]
  },
  {
    question_text: 'What does fill the frame mean in photography?',
    question_type: 'mcq',
    difficulty_level: 'easy',
    max_score: 1.0,
    answers: [
      { answer_text: 'Getting close to eliminate unnecessary background elements', is_correct: 1 },
      { answer_text: 'Using the largest image file format', is_correct: 0 },
      { answer_text: 'Taking photos in full frame camera mode', is_correct: 0 },
      { answer_text: 'Using wide angle lens only', is_correct: 0 }
    ]
  },
  {
    question_text: 'What is depth of field and how does it affect composition?',
    question_type: 'mcq',
    difficulty_level: 'medium',
    max_score: 1.0,
    answers: [
      { answer_text: 'The range of distance that appears sharp; helps isolate subjects', is_correct: 1 },
      { answer_text: 'The physical depth of the camera', is_correct: 0 },
      { answer_text: 'The distance between camera and subject', is_correct: 0 },
      { answer_text: 'The amount of light in the photo', is_correct: 0 }
    ]
  }
];

async function populateCompositionQuestions() {
  let pool;
  try {
    pool = await sql.connect(config);
    console.log('🔗 Connected to database');

    // Find Composition Techniques MOOC
    console.log('\n🎯 Finding Composition Techniques MOOC...');
    const moocResult = await pool.request().query(`
      SELECT mooc_id, title 
      FROM moocs 
      WHERE title LIKE '%Composition%' OR mooc_id = 54
      ORDER BY mooc_id
    `);
    
    if (moocResult.recordset.length === 0) {
      console.log('❌ Composition Techniques MOOC not found!');
      return;
    }

    const compositionMOOC = moocResult.recordset[0];
    console.log(`Found: MOOC ${compositionMOOC.mooc_id} - ${compositionMOOC.title}`);

    // Clear existing questions
    console.log('\n🧹 Clearing existing questions for MOOC 54...');
    const deleteResult = await pool.request()
      .input('moocId', sql.BigInt, 54)
      .query('DELETE FROM questions WHERE mooc_id = @moocId');
    
    console.log(`Cleared ${deleteResult.rowsAffected[0]} existing questions`);

    // Insert new questions
    console.log('\n➕ Adding composition questions...');
    
    for (let i = 0; i < compositionQuestions.length; i++) {
      const question = compositionQuestions[i];
      
      // Insert question
      const questionResult = await pool.request()
        .input('moocId', sql.BigInt, 54)
        .input('stem', sql.NVarChar(sql.MAX), question.question_text)
        .input('qtype', sql.VarChar(50), 'mcq')
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

      // Insert answers
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

    // Verification
    console.log('\n✅ Verification...');
    const verifyResult = await pool.request()
      .input('moocId', sql.BigInt, 54)
      .query(`
        SELECT COUNT(*) as question_count
        FROM questions 
        WHERE mooc_id = @moocId
      `);
    
    const questionCount = verifyResult.recordset[0].question_count;
    console.log(`📊 Total questions for MOOC 54: ${questionCount}`);

    console.log('\n🎉 SUCCESS! Composition Techniques populated!');
    console.log(`📋 Summary: MOOC 54 now has ${questionCount} questions`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

populateCompositionQuestions();