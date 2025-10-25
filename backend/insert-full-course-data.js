import sql from 'mssql';

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

async function insertFullCourseData() {
  try {
    await sql.connect(config);
    console.log('✅ Connected to database\n');

    // 1. Check courses table structure
    console.log('📋 Checking COURSES table structure...');
    const coursesColumns = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'courses'
      ORDER BY ORDINAL_POSITION
    `);
    coursesColumns.recordset.forEach(col => {
      console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE})`);
    });

    // 2. Check moocs table structure
    console.log('\n📋 Checking MOOCS table structure...');
    const moocsColumns = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'moocs'
      ORDER BY ORDINAL_POSITION
    `);
    moocsColumns.recordset.forEach(col => {
      console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE})`);
    });

    // 3. Check lessons table structure
    console.log('\n📋 Checking LESSONS table structure...');
    const lessonsColumns = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'lessons'
      ORDER BY ORDINAL_POSITION
    `);
    lessonsColumns.recordset.forEach(col => {
      console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE})`);
    });

    // 4. Check current data
    console.log('\n📊 Current COURSES data:');
    const courses = await sql.query(`
      SELECT TOP 5 c.course_id, c.title, c.status,
             (SELECT COUNT(*) FROM moocs WHERE course_id = c.course_id) as mooc_count,
             (SELECT COUNT(*) FROM lessons l 
              INNER JOIN moocs m ON l.mooc_id = m.mooc_id 
              WHERE m.course_id = c.course_id) as lesson_count
      FROM courses c
      ORDER BY c.course_id
    `);
    courses.recordset.forEach(c => {
      console.log(`  ID ${c.course_id}: ${c.title}`);
      console.log(`    Moocs: ${c.mooc_count} | Lessons: ${c.lesson_count}`);
    });

    // 5. Check if we need to add moocs and lessons
    console.log('\n🔍 Checking courses that need content...');
    const needContent = await sql.query(`
      SELECT c.course_id, c.title,
             (SELECT COUNT(*) FROM moocs WHERE course_id = c.course_id) as mooc_count
      FROM courses c
      WHERE (SELECT COUNT(*) FROM moocs WHERE course_id = c.course_id) = 0
    `);
    
    if (needContent.recordset.length > 0) {
      console.log(`\n📝 Found ${needContent.recordset.length} courses needing content. Adding moocs and lessons...\n`);
      
      for (const course of needContent.recordset) {
        console.log(`\n➕ Adding content for: ${course.title} (ID: ${course.course_id})`);
        
        // Insert 4-6 moocs per course
        const moocCount = 4 + Math.floor(Math.random() * 3); // 4-6 moocs
        
        for (let i = 1; i <= moocCount; i++) {
          const moocTitle = [
            'Giới thiệu và khởi đầu',
            'Kiến thức nền tảng',
            'Thực hành cơ bản',
            'Kỹ thuật nâng cao',
            'Dự án thực tế',
            'Tổng kết và đánh giá'
          ][i - 1] || `Module ${i}`;
          
          // Insert mooc
          const moocResult = await sql.query`
            INSERT INTO moocs (course_id, title, order_no)
            OUTPUT INSERTED.mooc_id
            VALUES (${course.course_id}, ${moocTitle}, ${i})
          `;
          
          const moocId = moocResult.recordset[0].mooc_id;
          console.log(`  ✓ Mooc ${i}: ${moocTitle} (ID: ${moocId})`);
          
          // Insert 4-8 lessons per mooc
          const lessonCount = 4 + Math.floor(Math.random() * 5); // 4-8 lessons
          
          for (let j = 1; j <= lessonCount; j++) {
            const lessonTypes = ['video', 'reading', 'quiz', 'assignment'];
            const contentType = lessonTypes[Math.floor(Math.random() * lessonTypes.length)];
            
            const lessonTitles = {
              video: [
                'Video bài giảng',
                'Demo thực hành',
                'Giải thích chi tiết',
                'Case study',
                'Live coding session'
              ],
              reading: [
                'Tài liệu tham khảo',
                'Đọc thêm về',
                'Lý thuyết nâng cao',
                'Best practices',
                'Kinh nghiệm thực tế'
              ],
              quiz: [
                'Bài kiểm tra kiến thức',
                'Quiz ôn tập',
                'Đánh giá hiểu biết',
                'Câu hỏi thảo luận'
              ],
              assignment: [
                'Bài tập thực hành',
                'Dự án nhỏ',
                'Challenge',
                'Homework'
              ]
            };
            
            const titleOptions = lessonTitles[contentType];
            const lessonTitle = `${titleOptions[Math.floor(Math.random() * titleOptions.length)]} ${i}.${j}`;
            
            // First 2 lessons are preview
            const isPreview = j <= 2;
            
            await sql.query`
              INSERT INTO lessons (mooc_id, title, content_type, order_no, is_preview)
              VALUES (${moocId}, ${lessonTitle}, ${contentType}, ${j}, ${isPreview ? 1 : 0})
            `;
            
            console.log(`    - Lesson ${j}: ${lessonTitle} (${contentType}${isPreview ? ', PREVIEW' : ''})`);
          }
        }
      }
    } else {
      console.log('✅ All courses already have content!');
    }

    // 6. Add reviews if missing
    console.log('\n📝 Checking and adding reviews...');
    const needReviews = await sql.query(`
      SELECT c.course_id, c.title,
             (SELECT COUNT(*) FROM reviews WHERE course_id = c.course_id) as review_count
      FROM courses c
      WHERE (SELECT COUNT(*) FROM reviews WHERE course_id = c.course_id) < 5
    `);

    if (needReviews.recordset.length > 0) {
      // Get random learners
      const learners = await sql.query(`
        SELECT TOP 10 user_id, full_name FROM users WHERE role_id = 3
      `);

      for (const course of needReviews.recordset) {
        const neededReviews = 5 - course.review_count;
        if (neededReviews > 0) {
          console.log(`\n➕ Adding ${neededReviews} reviews for: ${course.title}`);
          
          const reviewTexts = [
            'Khóa học rất hay và bổ ích! Giảng viên dạy dễ hiểu.',
            'Nội dung đầy đủ, chi tiết. Rất đáng để học!',
            'Khóa học tuyệt vời! Tôi đã học được rất nhiều điều mới.',
            'Giảng viên nhiệt tình, hỗ trợ tốt. Highly recommended!',
            'Content chất lượng cao, đáng đồng tiền bát gạo!',
            'Khóa học phù hợp cho người mới bắt đầu.',
            'Rất hài lòng với khóa học này. 5 sao!',
            'Học xong có thể áp dụng vào thực tế ngay.',
            'Video chất lượng tốt, giải thích rõ ràng.',
            'Đây là khóa học tốt nhất mà tôi từng tham gia!'
          ];

          for (let i = 0; i < neededReviews && i < learners.recordset.length; i++) {
            const learner = learners.recordset[i];
            const rating = 4 + Math.floor(Math.random() * 2); // 4 or 5 stars
            const reviewText = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
            
            await sql.query`
              INSERT INTO reviews (course_id, user_id, rating, comment, created_at)
              VALUES (${course.course_id}, ${learner.user_id}, ${rating}, ${reviewText}, GETDATE())
            `;
            
            console.log(`  ✓ Review from ${learner.full_name}: ${rating} stars`);
          }
        }
      }
    }

    // 7. Add enrollments if missing
    console.log('\n📝 Checking and adding enrollments...');
    const learners = await sql.query(`
      SELECT user_id FROM users WHERE role_id = 3
    `);

    for (const course of courses.recordset) {
      const currentEnrollments = await sql.query`
        SELECT COUNT(*) as count FROM enrollments WHERE course_id = ${course.course_id}
      `;

      if (currentEnrollments.recordset[0].count < 10) {
        const needed = 10 - currentEnrollments.recordset[0].count;
        console.log(`\n➕ Adding ${needed} enrollments for course ${course.course_id}`);
        
        for (let i = 0; i < needed && i < learners.recordset.length; i++) {
          const learnerId = learners.recordset[i].user_id;
          
          // Check if already enrolled
          const exists = await sql.query`
            SELECT COUNT(*) as count FROM enrollments 
            WHERE course_id = ${course.course_id} AND user_id = ${learnerId}
          `;

          if (exists.recordset[0].count === 0) {
            await sql.query`
              INSERT INTO enrollments (user_id, course_id, enrolled_at, status)
              VALUES (${learnerId}, ${course.course_id}, GETDATE(), 'active')
            `;
            console.log(`  ✓ Enrolled user ${learnerId}`);
          }
        }
      }
    }

    // 8. Final summary
    console.log('\n\n📊 FINAL SUMMARY:');
    const summary = await sql.query(`
      SELECT 
        c.course_id,
        c.title,
        (SELECT COUNT(*) FROM moocs WHERE course_id = c.course_id) as moocs,
        (SELECT COUNT(*) FROM lessons l 
         INNER JOIN moocs m ON l.mooc_id = m.mooc_id 
         WHERE m.course_id = c.course_id) as lessons,
        (SELECT COUNT(*) FROM reviews WHERE course_id = c.course_id) as reviews,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.course_id) as enrollments
      FROM courses c
      ORDER BY c.course_id
    `);

    console.log('\nCourse ID | Title                    | Moocs | Lessons | Reviews | Enrollments');
    console.log('----------|--------------------------|-------|---------|---------|------------');
    summary.recordset.forEach(c => {
      console.log(`${String(c.course_id).padEnd(9)} | ${c.title.substring(0, 24).padEnd(24)} | ${String(c.moocs).padEnd(5)} | ${String(c.lessons).padEnd(7)} | ${String(c.reviews).padEnd(7)} | ${c.enrollments}`);
    });

    console.log('\n✅ Done! All courses now have full data.');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sql.close();
  }
}

insertFullCourseData();
