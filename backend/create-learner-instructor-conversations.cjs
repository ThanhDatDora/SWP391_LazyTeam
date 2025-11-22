/**
 * Script tạo conversations cho learner-instructor
 * 1 conversation duy nhất cho mỗi cặp learner-instructor
 */

const sql = require('mssql');

const config = {
  user: 'sa',
  password: '123456',
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function createLearnerInstructorConversations() {
  try {
    console.log('📚 Connecting to database...');
    const pool = await sql.connect(config);

    // 1. Tìm learner "SV. Nguyễn Văn B"
    console.log('\n🔍 Finding learner...');
    const learnerResult = await pool.request().query(`
      SELECT user_id, full_name, email
      FROM users
      WHERE full_name LIKE N'%Nguyễn Văn B%'
    `);

    if (learnerResult.recordset.length === 0) {
      console.log('❌ Không tìm thấy learner');
      return;
    }

    const learner = learnerResult.recordset[0];
    console.log(`✅ Found: ${learner.full_name} (ID: ${learner.user_id})`);

    // 2. Tìm tất cả instructors mà learner đã enroll courses của họ
    console.log('\n🔍 Finding instructors from enrolled courses...');
    const instructorsResult = await pool.request()
      .input('userId', sql.BigInt, learner.user_id)
      .query(`
        SELECT DISTINCT
          u.user_id as instructor_id,
          u.full_name as instructor_name,
          u.email as instructor_email,
          COUNT(c.course_id) as course_count,
          STRING_AGG(c.title, ', ') as course_titles
        FROM enrollments e
        INNER JOIN courses c ON e.course_id = c.course_id
        INNER JOIN users u ON c.owner_instructor_id = u.user_id
        WHERE e.user_id = @userId AND u.role_id = 2
        GROUP BY u.user_id, u.full_name, u.email
      `);

    if (instructorsResult.recordset.length === 0) {
      console.log('❌ Learner chưa enroll course nào');
      return;
    }

    console.log(`✅ Found ${instructorsResult.recordset.length} instructors:`);
    instructorsResult.recordset.forEach(i => {
      console.log(`   - ${i.instructor_name}: ${i.course_count} courses (${i.course_titles})`);
    });

    // 3. Tạo conversation cho mỗi instructor
    console.log('\n💬 Creating conversations...');
    
    for (const instructor of instructorsResult.recordset) {
      // Check xem đã có conversation chưa
      const existingConv = await pool.request()
        .input('learnerId', sql.BigInt, learner.user_id)
        .input('instructorId', sql.BigInt, instructor.instructor_id)
        .query(`
          SELECT conversation_id
          FROM learner_conversations
          WHERE learner_id = @learnerId AND instructor_id = @instructorId
        `);

      if (existingConv.recordset.length > 0) {
        console.log(`⏭️  Skip: Conversation already exists with ${instructor.instructor_name}`);
        continue;
      }

      // Tạo conversation
      const convResult = await pool.request()
        .input('learnerId', sql.BigInt, learner.user_id)
        .input('instructorId', sql.BigInt, instructor.instructor_id)
        .input('status', sql.NVarChar(50), 'active')
        .input('createdAt', sql.DateTime2, new Date())
        .query(`
          INSERT INTO learner_conversations 
            (learner_id, instructor_id, status, created_at, updated_at, last_message_at)
          VALUES 
            (@learnerId, @instructorId, @status, @createdAt, @createdAt, @createdAt);
          
          SELECT SCOPE_IDENTITY() AS conversation_id;
        `);

      const conversationId = convResult.recordset[0].conversation_id;
      console.log(`✅ Created conversation #${conversationId} with ${instructor.instructor_name}`);
      console.log(`   📚 Courses: ${instructor.course_titles}`);

      // Tạo tin nhắn chào mừng
      await pool.request()
        .input('conversationId', sql.BigInt, conversationId)
        .input('senderId', sql.BigInt, instructor.instructor_id)
        .input('messageText', sql.NVarChar(sql.MAX), 
          `Chào bạn ${learner.full_name}! Mình là ${instructor.instructor_name}. Bạn đang học ${instructor.course_count} khóa học của mình. Nếu có câu hỏi gì về các khóa học, đừng ngại nhắn tin nhé! 😊`)
        .input('messageType', sql.NVarChar(50), 'text')
        .input('createdAt', sql.DateTime2, new Date())
        .query(`
          INSERT INTO learner_chat_messages 
            (conversation_id, sender_id, message_text, message_type, created_at, is_read)
          VALUES 
            (@conversationId, @senderId, @messageText, @messageType, @createdAt, 0)
        `);

      console.log(`   📨 Sent welcome message`);
    }

    console.log('\n✅ ĐÃ HOÀN THÀNH!');
    console.log(`📊 Summary:`);
    console.log(`   - Learner: ${learner.full_name}`);
    console.log(`   - Conversations: ${instructorsResult.recordset.length}`);
    console.log('\n💡 Mỗi instructor chỉ có 1 conversation duy nhất!');

    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createLearnerInstructorConversations();
