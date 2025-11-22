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

// Questions for Course 9: Photography/Camera Fundamentals
const cameraQuestions = [
  {
    stem: 'What does ISO control in photography?',
    qtype: 'mcq',
    difficulty: 'easy',
    max_score: 1.0,
    options: [
      { label: 'A', content: 'Camera sensitivity to light', is_correct: true },
      { label: 'B', content: 'Shutter speed', is_correct: false },
      { label: 'C', content: 'Aperture size', is_correct: false },
      { label: 'D', content: 'Focus distance', is_correct: false }
    ]
  },
  {
    stem: 'What is the exposure triangle in photography?',
    qtype: 'mcq',
    difficulty: 'medium',
    max_score: 1.0,
    options: [
      { label: 'A', content: 'ISO, Aperture, Shutter Speed', is_correct: true },
      { label: 'B', content: 'ISO, Focus, White Balance', is_correct: false },
      { label: 'C', content: 'Aperture, Focus, Zoom', is_correct: false },
      { label: 'D', content: 'Shutter Speed, Flash, ISO', is_correct: false }
    ]
  },
  {
    stem: 'What does f/2.8 represent in camera settings?',
    qtype: 'mcq',
    difficulty: 'medium',
    max_score: 1.0,
    options: [
      { label: 'A', content: 'Aperture setting', is_correct: true },
      { label: 'B', content: 'Shutter speed', is_correct: false },
      { label: 'C', content: 'ISO value', is_correct: false },
      { label: 'D', content: 'Focal length', is_correct: false }
    ]
  },
  {
    stem: 'Which setting creates a shallow depth of field?',
    qtype: 'mcq',
    difficulty: 'medium',
    max_score: 1.0,
    options: [
      { label: 'A', content: 'Wide aperture (low f-number like f/1.4)', is_correct: true },
      { label: 'B', content: 'Narrow aperture (high f-number like f/16)', is_correct: false },
      { label: 'C', content: 'High ISO', is_correct: false },
      { label: 'D', content: 'Fast shutter speed', is_correct: false }
    ]
  },
  {
    stem: 'What is the rule of thirds in photography?',
    qtype: 'mcq',
    difficulty: 'easy',
    max_score: 1.0,
    options: [
      { label: 'A', content: 'Dividing image into 9 equal sections for composition', is_correct: true },
      { label: 'B', content: 'Taking 3 photos of each subject', is_correct: false },
      { label: 'C', content: 'Using 3 different camera settings', is_correct: false },
      { label: 'D', content: 'Shooting at 3 different times', is_correct: false }
    ]
  },
  {
    stem: 'What does a faster shutter speed do?',
    qtype: 'mcq',
    difficulty: 'medium',
    max_score: 1.0,
    options: [
      { label: 'A', content: 'Freezes motion and reduces motion blur', is_correct: true },
      { label: 'B', content: 'Increases depth of field', is_correct: false },
      { label: 'C', content: 'Makes image brighter', is_correct: false },
      { label: 'D', content: 'Increases ISO automatically', is_correct: false }
    ]
  },
  {
    stem: 'What is white balance in photography?',
    qtype: 'mcq',
    difficulty: 'easy',
    max_score: 1.0,
    options: [
      { label: 'A', content: 'Adjusting colors to match lighting conditions', is_correct: true },
      { label: 'B', content: 'Making the background white', is_correct: false },
      { label: 'C', content: 'Balancing light and shadow', is_correct: false },
      { label: 'D', content: 'Setting exposure to middle gray', is_correct: false }
    ]
  },
  {
    stem: 'What type of lens is best for portraits?',
    qtype: 'mcq',
    difficulty: 'medium',
    max_score: 1.0,
    options: [
      { label: 'A', content: '85mm-135mm telephoto lens', is_correct: true },
      { label: 'B', content: '14mm wide-angle lens', is_correct: false },
      { label: 'C', content: '300mm super telephoto', is_correct: false },
      { label: 'D', content: 'Fish-eye lens', is_correct: false }
    ]
  },
  {
    stem: 'What is the golden hour in photography?',
    qtype: 'mcq',
    difficulty: 'easy',
    max_score: 1.0,
    options: [
      { label: 'A', content: 'Hour after sunrise and before sunset with warm light', is_correct: true },
      { label: 'B', content: 'Exactly at noon with bright light', is_correct: false },
      { label: 'C', content: 'Any hour with yellow lighting', is_correct: false },
      { label: 'D', content: 'One hour of shooting time', is_correct: false }
    ]
  },
  {
    stem: 'What does manual focus mode allow you to do?',
    qtype: 'mcq',
    difficulty: 'easy',
    max_score: 1.0,
    options: [
      { label: 'A', content: 'Manually control which part of image is in focus', is_correct: true },
      { label: 'B', content: 'Manually set ISO value', is_correct: false },
      { label: 'C', content: 'Manually adjust white balance', is_correct: false },
      { label: 'D', content: 'Manually control flash power', is_correct: false }
    ]
  }
];

async function addCameraQuestions() {
  try {
    await sql.connect(config);
    console.log('🔗 Connected to database');

    // First, find exam_id for Camera Fundamentals (mooc_id = 53)
    const examResult = await sql.query(`
      SELECT exam_id, mooc_id 
      FROM exams 
      WHERE mooc_id = 53
    `);

    if (examResult.recordset.length === 0) {
      console.log('❌ No exam found for mooc_id 53 (Camera Fundamentals)');
      return;
    }

    const examId = examResult.recordset[0].exam_id;
    console.log(`📝 Found exam_id: ${examId} for Camera Fundamentals`);

    // Clear existing questions
    await sql.query(`DELETE FROM exam_answers WHERE question_id IN 
      (SELECT question_id FROM exam_questions WHERE exam_id = ${examId})`);
    await sql.query(`DELETE FROM exam_questions WHERE exam_id = ${examId}`);
    console.log('🧹 Cleared existing questions');

    // Add new questions
    for (let i = 0; i < cameraQuestions.length; i++) {
      const question = cameraQuestions[i];
      
      // Insert question
      const questionResult = await sql.query(`
        INSERT INTO exam_questions (exam_id, question_text, question_type, difficulty_level, max_score)
        OUTPUT INSERTED.question_id
        VALUES (${examId}, '${question.stem.replace(/'/g, "''")}', '${question.qtype}', '${question.difficulty}', ${question.max_score})
      `);
      
      const questionId = questionResult.recordset[0].question_id;
      console.log(`✅ Added question ${i + 1}: ${question.stem.substring(0, 50)}...`);

      // Insert answers
      for (const option of question.options) {
        await sql.query(`
          INSERT INTO exam_answers (question_id, answer_text, is_correct)
          VALUES (${questionId}, '${option.content.replace(/'/g, "''")}', ${option.is_correct ? 1 : 0})
        `);
      }
    }

    console.log(`🎉 Successfully added ${cameraQuestions.length} questions to Camera Fundamentals exam!`);

    // Verify the count
    const countResult = await sql.query(`
      SELECT COUNT(*) as total_questions 
      FROM exam_questions 
      WHERE exam_id = ${examId}
    `);
    console.log(`📊 Total questions in exam: ${countResult.recordset[0].total_questions}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.close();
  }
}

addCameraQuestions();