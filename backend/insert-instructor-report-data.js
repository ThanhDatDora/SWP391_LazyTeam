// =====================================================
// INSERT: Instructor Report Data
// (Enrollments + Paid Invoices)
// =====================================================

import { getPool } from './config/database.js';
import sql from 'mssql';

async function insertInstructorReportData() {
  console.log('🚀 Inserting instructor report data...\n');
  
  try {
    const pool = await getPool();
    console.log('✅ Connected to database\n');
    
    // Step 1: Get or create learners
    console.log('👥 Checking for learner accounts...');
    const learnersResult = await pool.request().query(`
      SELECT TOP 3 user_id, full_name 
      FROM users 
      WHERE role_id = 3
      ORDER BY user_id
    `);
    
    let learnerIds = learnersResult.recordset.map(l => l.user_id);
    
    if (learnerIds.length < 3) {
      console.log('⚠️  Not enough learners, creating sample accounts...');
      
      // Create sample learners
      const sampleLearners = [
        { username: 'learner_test1', email: 'learner1@test.com', fullName: 'Nguyễn Văn A' },
        { username: 'learner_test2', email: 'learner2@test.com', fullName: 'Trần Thị B' },
        { username: 'learner_test3', email: 'learner3@test.com', fullName: 'Lê Văn C' }
      ];
      
      for (const learner of sampleLearners) {
        try {
          // Check if learner already exists
          const existingResult = await pool.request()
            .input('email', sql.NVarChar, learner.email)
            .query('SELECT user_id FROM users WHERE email = @email');
          
          if (existingResult.recordset.length === 0) {
            await pool.request()
              .input('username', sql.NVarChar, learner.username)
              .input('email', sql.NVarChar, learner.email)
              .input('password_hash', sql.NVarChar, '$2b$10$SAMPLE_HASH_FOR_TESTING_ONLY')
              .input('full_name', sql.NVarChar, learner.fullName)
              .input('role_id', sql.Int, 3)
              .input('status', sql.NVarChar, 'active')
              .query(`
                INSERT INTO users (username, email, password_hash, full_name, role_id, status, created_at, updated_at)
                VALUES (@username, @email, @password_hash, @full_name, @role_id, @status, GETDATE(), GETDATE())
              `);
            
            console.log(`  ✅ Created learner: ${learner.fullName}`);
          }
        } catch (error) {
          console.log(`  ⚠️  Learner ${learner.email} already exists or error: ${error.message}`);
        }
      }
      
      // Refresh learner IDs
      const newLearnersResult = await pool.request().query(`
        SELECT TOP 3 user_id, full_name 
        FROM users 
        WHERE role_id = 3
        ORDER BY user_id
      `);
      learnerIds = newLearnersResult.recordset.map(l => l.user_id);
    }
    
    console.log(`✅ Found ${learnerIds.length} learners: ${learnerIds.join(', ')}\n`);
    
    // Step 2: Get courses owned by instructor 2
    console.log('📚 Getting courses owned by instructor 2...');
    const coursesResult = await pool.request().query(`
      SELECT TOP 5 course_id, title, price
      FROM courses
      WHERE owner_instructor_id = 2
      ORDER BY created_at DESC
    `);
    
    const courses = coursesResult.recordset;
    console.log(`✅ Found ${courses.length} courses\n`);
    
    if (courses.length === 0) {
      console.log('❌ No courses found for instructor 2. Cannot create enrollments.');
      process.exit(1);
    }
    
    // Step 3: Create enrollments and invoices
    console.log('📝 Creating enrollments and paid invoices...\n');
    
    let enrollmentCount = 0;
    let invoiceCount = 0;
    
    // For each course, enroll some learners and create paid invoices
    for (let i = 0; i < Math.min(3, courses.length); i++) {
      const course = courses[i];
      const numEnrollments = (i % 3) + 1; // 1, 2, or 3 enrollments per course
      
      console.log(`📖 Course: ${course.title}`);
      
      for (let j = 0; j < numEnrollments && j < learnerIds.length; j++) {
        const learnerId = learnerIds[j];
        
        try {
          // Check if enrollment already exists
          const existingEnrollment = await pool.request()
            .input('user_id', sql.BigInt, learnerId)
            .input('course_id', sql.BigInt, course.course_id)
            .query('SELECT enrollment_id FROM enrollments WHERE user_id = @user_id AND course_id = @course_id');
          
          if (existingEnrollment.recordset.length === 0) {
            // Create enrollment
            await pool.request()
              .input('user_id', sql.BigInt, learnerId)
              .input('course_id', sql.BigInt, course.course_id)
              .input('enrolled_at', sql.DateTime2, new Date(Date.now() - (30 - i * 5 - j * 2) * 24 * 60 * 60 * 1000))
              .input('status', sql.NVarChar, 'active')
              .query(`
                INSERT INTO enrollments (user_id, course_id, enrolled_at, status)
                VALUES (@user_id, @course_id, @enrolled_at, @status)
              `);
            
            enrollmentCount++;
            console.log(`  ✅ Enrolled learner ${learnerId}`);
            
            // Create paid invoice
            const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            await pool.request()
              .input('user_id', sql.BigInt, learnerId)
              .input('course_id', sql.BigInt, course.course_id)
              .input('amount', sql.Decimal(10, 2), course.price)
              .input('status', sql.NVarChar, 'paid')
              .input('payment_method', sql.NVarChar, j % 2 === 0 ? 'vnpay' : 'momo')
              .input('transaction_id', sql.NVarChar, transactionId)
              .input('created_at', sql.DateTime2, new Date(Date.now() - (30 - i * 5 - j * 2) * 24 * 60 * 60 * 1000))
              .query(`
                INSERT INTO invoices (user_id, course_id, amount, status, payment_method, transaction_id, created_at, paid_at)
                VALUES (@user_id, @course_id, @amount, @status, @payment_method, @transaction_id, @created_at, @created_at)
              `);
            
            invoiceCount++;
            console.log(`  💰 Created paid invoice: ${new Intl.NumberFormat('vi-VN').format(course.price)} VND`);
          } else {
            console.log(`  ⚠️  Learner ${learnerId} already enrolled`);
          }
          
        } catch (error) {
          console.log(`  ⚠️  Error for learner ${learnerId}: ${error.message}`);
        }
      }
      
      console.log('');
    }
    
    console.log(`✅ Created ${enrollmentCount} enrollments and ${invoiceCount} paid invoices\n`);
    
    // Step 4: Verify instructor report data
    console.log('🔍 Verifying instructor report data...\n');
    
    const reportResult = await pool.request().query(`
      SELECT 
        i.instructor_id,
        u.full_name as instructor_name,
        u.email,
        COUNT(DISTINCT c.course_id) as total_courses,
        COUNT(DISTINCT e.enrollment_id) as total_students,
        ISNULL(SUM(inv.amount), 0) as total_revenue
      FROM instructors i
      JOIN users u ON i.instructor_id = u.user_id
      LEFT JOIN courses c ON c.owner_instructor_id = i.instructor_id
      LEFT JOIN enrollments e ON e.course_id = c.course_id
      LEFT JOIN invoices inv ON inv.course_id = c.course_id AND inv.status = 'paid'
      WHERE i.instructor_id = 2
      GROUP BY i.instructor_id, u.full_name, u.email
    `);
    
    if (reportResult.recordset.length > 0) {
      const report = reportResult.recordset[0];
      console.log('📊 Instructor Report for ID 2:');
      console.log(`  👤 Name: ${report.instructor_name}`);
      console.log(`  📧 Email: ${report.email}`);
      console.log(`  📚 Total Courses: ${report.total_courses}`);
      console.log(`  👥 Total Students: ${report.total_students}`);
      console.log(`  💰 Total Revenue: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(report.total_revenue)}`);
    }
    
    console.log('\n🎯 Next steps:');
    console.log('  1. Open Admin Panel → Báo cáo giảng viên');
    console.log('  2. You should see updated instructor statistics\n');
    
    await pool.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

insertInstructorReportData();
