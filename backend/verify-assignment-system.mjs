import sql from 'mssql';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function verifyAssignmentSystem() {
  try {
    console.log('🔍 Verifying Assignment Grading System Setup...\n');
    
    const pool = await sql.connect(config);

    // 1. Check for assignment lessons
    console.log('📚 Assignment Lessons:');
    console.log('=' .repeat(80));
    const lessons = await pool.request().query(`
      SELECT 
        l.lesson_id,
        l.title as lesson_title,
        l.content_type,
        m.title as mooc_title,
        c.title as course_title,
        c.course_id
      FROM lessons l
      JOIN moocs m ON l.mooc_id = m.mooc_id
      JOIN courses c ON m.course_id = c.course_id
      WHERE l.content_type = 'assignment'
      ORDER BY c.course_id, m.order_no, l.order_no
    `);

    if (lessons.recordset.length === 0) {
      console.log('⚠️  No assignment lessons found!');
      console.log('   Create an assignment lesson first using the instructor UI.');
    } else {
      lessons.recordset.forEach((lesson, index) => {
        console.log(`${index + 1}. [Course ${lesson.course_id}] ${lesson.course_title}`);
        console.log(`   MOOC: ${lesson.mooc_title}`);
        console.log(`   Lesson: ${lesson.lesson_title} (ID: ${lesson.lesson_id})`);
        console.log('');
      });
    }

    // 2. Check for submissions
    console.log('\n📝 Assignment Submissions:');
    console.log('=' .repeat(80));
    const submissions = await pool.request().query(`
      SELECT 
        es.essay_submission_id,
        u.full_name as student_name,
        u.email as student_email,
        l.title as assignment_title,
        c.title as course_title,
        es.status,
        es.score,
        es.submitted_at,
        es.graded_at,
        g.full_name as grader_name
      FROM essay_submissions es
      JOIN users u ON es.user_id = u.user_id
      JOIN lessons l ON es.task_id = l.lesson_id
      JOIN moocs m ON l.mooc_id = m.mooc_id
      JOIN courses c ON m.course_id = c.course_id
      LEFT JOIN users g ON es.graded_by = g.user_id
      ORDER BY es.submitted_at DESC
    `);

    if (submissions.recordset.length === 0) {
      console.log('📭 No submissions yet.');
      console.log('   Students need to submit assignments first.');
    } else {
      submissions.recordset.forEach((sub, index) => {
        console.log(`${index + 1}. ${sub.student_name} (${sub.student_email})`);
        console.log(`   Course: ${sub.course_title}`);
        console.log(`   Assignment: ${sub.assignment_title}`);
        console.log(`   Status: ${sub.status}`);
        if (sub.submitted_at) {
          console.log(`   Submitted: ${sub.submitted_at.toLocaleString('vi-VN')}`);
        }
        if (sub.status === 'graded') {
          console.log(`   Score: ${sub.score}/100`);
          if (sub.graded_at) {
            console.log(`   Graded by: ${sub.grader_name} at ${sub.graded_at.toLocaleString('vi-VN')}`);
          }
        }
        console.log('');
      });
    }

    // 3. Check for instructors
    console.log('\n👨‍🏫 Instructors:');
    console.log('=' .repeat(80));
    const instructors = await pool.request().query(`
      SELECT 
        u.user_id,
        u.full_name,
        u.email,
        r.role_name,
        COUNT(c.course_id) as course_count
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN courses c ON u.user_id = c.owner_instructor_id
      WHERE r.role_name = 'instructor'
      GROUP BY u.user_id, u.full_name, u.email, r.role_name
      ORDER BY u.full_name
    `);

    instructors.recordset.forEach((inst, index) => {
      console.log(`${index + 1}. ${inst.full_name} (${inst.email})`);
      console.log(`   ID: ${inst.user_id} | Courses: ${inst.course_count}`);
      console.log('');
    });

    // 4. Check for students
    console.log('\n👨‍🎓 Students with Enrollments:');
    console.log('=' .repeat(80));
    const students = await pool.request().query(`
      SELECT TOP 10
        u.user_id,
        u.full_name,
        u.email,
        COUNT(e.enrollment_id) as enrolled_courses
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN enrollments e ON u.user_id = e.user_id
      WHERE r.role_name = 'learner'
      GROUP BY u.user_id, u.full_name, u.email
      HAVING COUNT(e.enrollment_id) > 0
      ORDER BY COUNT(e.enrollment_id) DESC
    `);

    students.recordset.forEach((student, index) => {
      console.log(`${index + 1}. ${student.full_name} (${student.email})`);
      console.log(`   Enrolled in ${student.enrolled_courses} courses`);
      console.log('');
    });

    // 5. Summary
    console.log('\n📊 System Summary:');
    console.log('=' .repeat(80));
    
    const summary = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM lessons WHERE content_type = 'assignment') as assignment_count,
        (SELECT COUNT(*) FROM essay_submissions) as total_submissions,
        (SELECT COUNT(*) FROM essay_submissions WHERE status = 'pending') as pending_submissions,
        (SELECT COUNT(*) FROM essay_submissions WHERE status = 'graded') as graded_submissions,
        (SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id = r.role_id WHERE r.role_name = 'instructor') as instructor_count,
        (SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id = r.role_id WHERE r.role_name = 'learner') as student_count
    `);

    const stats = summary.recordset[0];
    console.log(`✅ Assignment Lessons: ${stats.assignment_count}`);
    console.log(`📝 Total Submissions: ${stats.total_submissions}`);
    console.log(`⏳ Pending Grading: ${stats.pending_submissions}`);
    console.log(`✓  Graded: ${stats.graded_submissions}`);
    console.log(`👨‍🏫 Instructors: ${stats.instructor_count}`);
    console.log(`👨‍🎓 Students: ${stats.student_count}`);

    // 6. Recommendations
    console.log('\n💡 Recommendations:');
    console.log('=' .repeat(80));
    
    if (lessons.recordset.length === 0) {
      console.log('⚠️  Create assignment lessons first:');
      console.log('   1. Login as instructor');
      console.log('   2. Go to course management');
      console.log('   3. Add a lesson with content_type = "assignment"');
    }
    
    if (submissions.recordset.length === 0) {
      console.log('⚠️  No submissions to test grading:');
      console.log('   1. Login as student');
      console.log('   2. Navigate to an assignment lesson');
      console.log('   3. Submit some text or upload a file');
    }
    
    if (stats.pending_submissions > 0) {
      console.log(`✅ ${stats.pending_submissions} submission(s) ready for grading!`);
      console.log('   Test the grading workflow:');
      console.log('   1. Login as instructor');
      console.log('   2. Go to /instructor/dashboard');
      console.log('   3. Click on a course → Assignments tab');
      console.log('   4. Click "Chấm điểm" to grade');
    }

    await pool.close();
    console.log('\n✅ Verification complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyAssignmentSystem();
