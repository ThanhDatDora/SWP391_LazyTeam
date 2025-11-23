const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  user: 'sa',
  password: '123456',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function copyQuestionsToMOOCs() {
  try {
    const pool = await sql.connect(config);
    
    const sourceMoocId = 52; // Introduction to Photography (60 questions)
    const targetMoocIds = [55, 56]; // Lighting Mastery, Final Project
    
    for (const targetMoocId of targetMoocIds) {
      console.log(`\n📝 Copying questions from MOOC ${sourceMoocId} to MOOC ${targetMoocId}...`);
      console.log('='.repeat(80));
      
      // Get questions from source MOOC
      const questionsResult = await pool.request()
        .input('sourceMoocId', sql.BigInt, sourceMoocId)
        .query(`
          SELECT TOP 10 question_id, stem, qtype, difficulty
          FROM questions
          WHERE mooc_id = @sourceMoocId
          ORDER BY NEWID()
        `);
      
      console.log(`✅ Found ${questionsResult.recordset.length} questions from source MOOC`);
      
      // Copy each question with its options
      for (const sourceQuestion of questionsResult.recordset) {
        // Insert new question
        const newQuestionResult = await pool.request()
          .input('moocId', sql.BigInt, targetMoocId)
          .input('stem', sql.NVarChar, sourceQuestion.stem)
          .input('qtype', sql.NVarChar, sourceQuestion.qtype)
          .input('difficulty', sql.NVarChar, sourceQuestion.difficulty)
          .query(`
            INSERT INTO questions (mooc_id, stem, qtype, difficulty)
            OUTPUT INSERTED.question_id
            VALUES (@moocId, @stem, @qtype, @difficulty)
          `);
        
        const newQuestionId = newQuestionResult.recordset[0].question_id;
        
        // Get options from source question
        const optionsResult = await pool.request()
          .input('questionId', sql.BigInt, sourceQuestion.question_id)
          .query(`
            SELECT label, content, is_correct
            FROM question_options
            WHERE question_id = @questionId
          `);
        
        // Copy options to new question
        for (const option of optionsResult.recordset) {
          await pool.request()
            .input('questionId', sql.BigInt, newQuestionId)
            .input('label', sql.NVarChar, option.label)
            .input('content', sql.NVarChar, option.content)
            .input('isCorrect', sql.Bit, option.is_correct)
            .query(`
              INSERT INTO question_options (question_id, label, content, is_correct)
              VALUES (@questionId, @label, @content, @isCorrect)
            `);
        }
        
        console.log(`   ✓ Copied question ${sourceQuestion.question_id} → ${newQuestionId} with ${optionsResult.recordset.length} options`);
      }
      
      console.log(`✅ Successfully copied 10 questions to MOOC ${targetMoocId}`);
    }
    
    // Verify
    console.log('\n\n📊 Verification:');
    console.log('='.repeat(80));
    
    for (const moocId of [55, 56]) {
      const countResult = await pool.request()
        .input('moocId', sql.BigInt, moocId)
        .query('SELECT COUNT(*) as count FROM questions WHERE mooc_id = @moocId');
      
      console.log(`MOOC ${moocId}: ${countResult.recordset[0].count} questions`);
    }
    
    console.log('\n✨ Done! All MOOCs now have questions for exams.');
    
    await pool.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
  }
}

copyQuestionsToMOOCs();
