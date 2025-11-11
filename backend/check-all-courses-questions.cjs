const sql = require('mssql');

const config = {
  user: 'sa',
  password: '123456',
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function checkAllCoursesQuestions() {
  try {
    console.log('🔍 Checking all MOOCs across all courses...\n');
    console.log('=' .repeat(80));

    const pool = await sql.connect(config);

    // Get all courses with their MOOCs and question counts
    const query = `
      SELECT 
        c.course_id,
        c.title as course_title,
        m.mooc_id,
        m.title as mooc_title,
        m.order_no,
        COUNT(q.question_id) as question_count
      FROM courses c
      LEFT JOIN moocs m ON c.course_id = m.course_id
      LEFT JOIN questions q ON m.mooc_id = q.mooc_id
      GROUP BY c.course_id, c.title, m.mooc_id, m.title, m.order_no
      ORDER BY c.course_id, m.order_no
    `;

    const result = await pool.request().query(query);

    let currentCourseId = null;
    let totalMOOCs = 0;
    let moocsWithQuestions = 0;
    let moocsWithoutQuestions = 0;
    let courseStats = {};

    for (const row of result.recordset) {
      // New course section
      if (currentCourseId !== row.course_id) {
        if (currentCourseId !== null) {
          console.log('-'.repeat(80));
        }
        currentCourseId = row.course_id;
        console.log(`\n📚 COURSE ${row.course_id}: ${row.course_title}`);
        console.log('=' .repeat(80));
        
        courseStats[row.course_id] = {
          title: row.course_title,
          total: 0,
          withQuestions: 0,
          withoutQuestions: 0,
          moocs: []
        };
      }

      if (row.mooc_id) {
        totalMOOCs++;
        courseStats[row.course_id].total++;

        const hasQuestions = row.question_count > 0;
        const status = hasQuestions ? '✅' : '❌';
        const warning = row.question_count < 10 && row.question_count > 0 ? ' ⚠️ (< 10 questions)' : '';

        console.log(`${status} MOOC ${row.mooc_id}: ${row.mooc_title} - ${row.question_count} questions${warning}`);

        if (hasQuestions) {
          moocsWithQuestions++;
          courseStats[row.course_id].withQuestions++;
        } else {
          moocsWithoutQuestions++;
          courseStats[row.course_id].withoutQuestions++;
        }

        courseStats[row.course_id].moocs.push({
          mooc_id: row.mooc_id,
          title: row.mooc_title,
          question_count: row.question_count
        });
      }
    }

    // Summary
    console.log('\n\n📊 OVERALL SUMMARY');
    console.log('=' .repeat(80));
    console.log(`Total MOOCs: ${totalMOOCs}`);
    console.log(`✅ MOOCs with questions: ${moocsWithQuestions}`);
    console.log(`❌ MOOCs without questions: ${moocsWithoutQuestions}`);
    console.log(`📈 Coverage: ${((moocsWithQuestions / totalMOOCs) * 100).toFixed(1)}%`);

    console.log('\n\n📊 COURSE-BY-COURSE SUMMARY');
    console.log('=' .repeat(80));
    for (const [courseId, stats] of Object.entries(courseStats)) {
      const coverage = stats.total > 0 ? ((stats.withQuestions / stats.total) * 100).toFixed(1) : 0;
      const status = stats.withoutQuestions === 0 ? '✅' : '⚠️';
      console.log(`\n${status} Course ${courseId}: ${stats.title}`);
      console.log(`   Total MOOCs: ${stats.total}`);
      console.log(`   With questions: ${stats.withQuestions}`);
      console.log(`   Without questions: ${stats.withoutQuestions}`);
      console.log(`   Coverage: ${coverage}%`);
      
      if (stats.withoutQuestions > 0) {
        console.log(`   ⚠️ Missing questions in:`);
        stats.moocs.filter(m => m.question_count === 0).forEach(m => {
          console.log(`      - MOOC ${m.mooc_id}: ${m.title}`);
        });
      }
    }

    // Recommendations
    if (moocsWithoutQuestions > 0) {
      console.log('\n\n💡 RECOMMENDATIONS');
      console.log('=' .repeat(80));
      console.log('The following MOOCs need questions added:');
      
      for (const [courseId, stats] of Object.entries(courseStats)) {
        const moocsNeedingQuestions = stats.moocs.filter(m => m.question_count === 0);
        if (moocsNeedingQuestions.length > 0) {
          console.log(`\nCourse ${courseId} - ${stats.title}:`);
          moocsNeedingQuestions.forEach(m => {
            console.log(`   - MOOC ${m.mooc_id}: ${m.title}`);
          });
        }
      }
    } else {
      console.log('\n\n✨ All MOOCs have questions! The exam system is ready.');
    }

    await pool.close();

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

checkAllCoursesQuestions();
