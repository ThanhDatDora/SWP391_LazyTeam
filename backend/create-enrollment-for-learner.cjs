/**
 * Script để tạo enrollment cho learner SV. Nguyễn Văn B
 * Sau khi enroll, learner có thể chat với instructor của course
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

async function createEnrollmentForLearner() {
  try {
    console.log('📚 Connecting to database...');
    const pool = await sql.connect(config);

    // 1. Tìm learner "SV. Nguyễn Văn B"
    console.log('\n🔍 Finding learner "SV. Nguyễn Văn B"...');
    const learnerResult = await pool.request().query(`
      SELECT user_id, full_name, email, role_id
      FROM users
      WHERE full_name LIKE N'%Nguyễn Văn B%' OR email LIKE '%nguyen%van%b%'
      ORDER BY user_id DESC
    `);

    if (learnerResult.recordset.length === 0) {
      console.log('❌ Không tìm thấy learner "SV. Nguyễn Văn B"');
      console.log('💡 Đang tìm tất cả learners...');
      
      const allLearnersResult = await pool.request().query(`
        SELECT TOP 5 user_id, full_name, email, role_id
        FROM users
        WHERE role_id = 3
        ORDER BY user_id DESC
      `);
      
      console.log('\n📋 Top 5 learners gần nhất:');
      allLearnersResult.recordset.forEach(u => {
        console.log(`   - ID: ${u.user_id}, Name: ${u.full_name}, Email: ${u.email}`);
      });
      
      return;
    }

    const learner = learnerResult.recordset[0];
    console.log(`✅ Found learner: ${learner.full_name} (ID: ${learner.user_id}, Email: ${learner.email})`);

    // 2. Lấy danh sách courses có instructor
    console.log('\n🔍 Finding courses with instructors...');
    const coursesResult = await pool.request().query(`
      SELECT TOP 3 
        c.course_id, 
        c.title,
        c.owner_instructor_id as instructor_id,
        u.full_name as instructor_name,
        u.email as instructor_email
      FROM courses c
      INNER JOIN users u ON c.owner_instructor_id = u.user_id
      WHERE c.status = 'active' AND u.role_id = 2
      ORDER BY c.created_at DESC
    `);

    if (coursesResult.recordset.length === 0) {
      console.log('❌ Không tìm thấy courses nào có instructor');
      return;
    }

    console.log(`✅ Found ${coursesResult.recordset.length} courses:`);
    coursesResult.recordset.forEach(c => {
      console.log(`   - ${c.title} (ID: ${c.course_id}) - Instructor: ${c.instructor_name}`);
    });

    // 3. Check xem learner đã enroll courses nào chưa
    console.log('\n🔍 Checking existing enrollments...');
    const existingEnrollments = await pool.request()
      .input('userId', sql.BigInt, learner.user_id)
      .query(`
        SELECT course_id, enrolled_at, status
        FROM enrollments
        WHERE user_id = @userId
      `);

    const enrolledCourseIds = existingEnrollments.recordset.map(e => e.course_id);
    console.log(`📌 Learner đã enroll ${enrolledCourseIds.length} courses: [${enrolledCourseIds.join(', ')}]`);

    // 4. Tạo enrollments cho các courses chưa enroll
    console.log('\n📝 Creating new enrollments...');
    let enrolledCount = 0;

    for (const course of coursesResult.recordset) {
      if (enrolledCourseIds.includes(course.course_id)) {
        console.log(`⏭️  Skip: Already enrolled in "${course.title}"`);
        continue;
      }

      const result = await pool.request()
        .input('userId', sql.BigInt, learner.user_id)
        .input('courseId', sql.BigInt, course.course_id)
        .input('enrolledAt', sql.DateTime2, new Date())
        .input('status', sql.NVarChar(50), 'active')
        .input('isCompleted', sql.Bit, 0)
        .query(`
          INSERT INTO enrollments (user_id, course_id, enrolled_at, status, is_completed)
          VALUES (@userId, @courseId, @enrolledAt, @status, @isCompleted)
        `);

      console.log(`✅ Enrolled in: "${course.title}" (Course ID: ${course.course_id})`);
      console.log(`   👨‍🏫 Instructor: ${course.instructor_name} (ID: ${course.instructor_id})`);
      enrolledCount++;
    }

    // 5. Tạo learner_conversations cho mỗi enrollment
    console.log('\n💬 Creating chat conversations with instructors...');
    
    for (const course of coursesResult.recordset) {
      // Check xem đã có conversation chưa
      const existingConv = await pool.request()
        .input('learnerId', sql.BigInt, learner.user_id)
        .input('courseId', sql.Int, course.course_id)
        .query(`
          SELECT conversation_id
          FROM learner_conversations
          WHERE learner_id = @learnerId AND course_id = @courseId
        `);

      if (existingConv.recordset.length > 0) {
        console.log(`⏭️  Skip: Conversation already exists for "${course.title}"`);
        continue;
      }

      const convResult = await pool.request()
        .input('learnerId', sql.BigInt, learner.user_id)
        .input('instructorId', sql.BigInt, course.instructor_id)
        .input('courseId', sql.Int, course.course_id)
        .input('status', sql.NVarChar(50), 'active')
        .input('createdAt', sql.DateTime, new Date())
        .input('lastMessageAt', sql.DateTime, new Date())
        .query(`
          INSERT INTO learner_conversations 
            (learner_id, instructor_id, course_id, status, created_at, updated_at, last_message_at)
          VALUES 
            (@learnerId, @instructorId, @courseId, @status, @createdAt, @createdAt, @lastMessageAt);
          
          SELECT SCOPE_IDENTITY() AS conversation_id;
        `);

      const conversationId = convResult.recordset[0].conversation_id;
      console.log(`✅ Created conversation #${conversationId} with ${course.instructor_name} for "${course.title}"`);

      // Tạo tin nhắn chào mừng
      await pool.request()
        .input('conversationId', sql.BigInt, conversationId)
        .input('senderId', sql.BigInt, course.instructor_id)
        .input('messageText', sql.NVarChar(sql.MAX), `Chào bạn ${learner.full_name}! Chào mừng bạn đến với khóa học "${course.title}". Nếu có bất kỳ câu hỏi nào, đừng ngại nhắn tin cho mình nhé! 😊`)
        .input('messageType', sql.NVarChar(50), 'text')
        .input('createdAt', sql.DateTime, new Date())
        .query(`
          INSERT INTO learner_chat_messages 
            (conversation_id, sender_id, message_text, message_type, created_at, is_read)
          VALUES 
            (@conversationId, @senderId, @messageText, @messageType, @createdAt, 0)
        `);

      console.log(`   📨 Sent welcome message from instructor`);
    }

    console.log('\n✅ ĐÃ HOÀN THÀNH!');
    console.log(`📊 Summary:`);
    console.log(`   - Learner: ${learner.full_name} (ID: ${learner.user_id})`);
    console.log(`   - New enrollments: ${enrolledCount}`);
    console.log(`   - Total courses: ${coursesResult.recordset.length}`);
    console.log('\n💡 Bây giờ learner có thể:');
    console.log('   1. Vào trang /learner/chat');
    console.log('   2. Xem danh sách conversations với instructors');
    console.log('   3. Chat realtime với từng instructor');

    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createEnrollmentForLearner();
