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

(async () => {
  try {
    const pool = await sql.connect(config);
    
    // Get student user
    const user = await pool.request()
      .input('email', sql.VarChar, 'learner@example.com')
      .query('SELECT user_id, full_name, email FROM users WHERE email = @email');
    
    if (user.recordset.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const userId = user.recordset[0].user_id;
    console.log(`👤 User: ${user.recordset[0].full_name} (ID: ${userId})`);
    console.log(`📧 Email: ${user.recordset[0].email}\n`);
    
    // Check enrollments
    const enrollments = await pool.request()
      .input('uid', sql.BigInt, userId)
      .query(`
        SELECT e.enrollment_id, e.course_id, c.title as course_title, e.status, e.enrolled_at
        FROM enrollments e
        JOIN courses c ON e.course_id = c.course_id
        WHERE e.user_id = @uid
        ORDER BY e.course_id
      `);
    
    console.log('📚 Enrollments:');
    console.log('================================\n');
    
    if (enrollments.recordset.length === 0) {
      console.log('❌ No enrollments found!\n');
      console.log('💡 To enroll in Course 2, run:');
      console.log('   INSERT INTO enrollments (user_id, course_id, status, enrolled_at)');
      console.log(`   VALUES (${userId}, 2, 'active', GETDATE());`);
    } else {
      enrollments.recordset.forEach(e => {
        const icon = e.course_id === 2 ? '✅' : '📖';
        console.log(`${icon} Course ${e.course_id}: ${e.course_title}`);
        console.log(`   Status: ${e.status}`);
        console.log(`   Enrolled: ${e.enrolled_at}`);
        console.log('');
      });
      
      const hasCourse2 = enrollments.recordset.some(e => e.course_id === 2);
      if (!hasCourse2) {
        console.log('⚠️ User NOT enrolled in Course 2!\n');
        console.log('💡 To enroll, run:');
        console.log(`   INSERT INTO enrollments (user_id, course_id, status, enrolled_at)`);
        console.log(`   VALUES (${userId}, 2, 'active', GETDATE());`);
      } else {
        console.log('✅ User IS enrolled in Course 2!');
      }
    }
    
    await pool.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
