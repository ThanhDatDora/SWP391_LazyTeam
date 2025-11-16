// =====================================================
// SIMPLE: Insert 3 Pending Courses
// =====================================================

import { getPool } from './config/database.js';
import sql from 'mssql';

async function insertPendingCourses() {
  console.log('🚀 Inserting 3 pending courses...\n');
  
  try {
    const pool = await getPool();
    console.log('✅ Connected to database\n');
    
    const courses = [
      {
        title: 'Advanced JavaScript - Master ES6+ Features',
        description: 'Khóa học JavaScript nâng cao với ES6+, async/await, promises, modules, và các design patterns hiện đại. Học cách xây dựng ứng dụng web chuyên nghiệp với JavaScript thuần.',
        categoryId: 1, // Web Development
        price: 1299000,
        level: 'Advanced',
        status: 'pending',
        language: 'vi'
      },
      {
        title: 'Full-Stack Web Development với MERN Stack',
        description: 'Khóa học toàn diện về phát triển web Full-Stack sử dụng MongoDB, Express.js, React, và Node.js. Xây dựng ứng dụng web từ đầu đến cuối với authentication, real-time features, và deployment.',
        categoryId: 1, // Web Development
        price: 1899000,
        level: 'Intermediate',
        status: 'draft',
        language: 'vi'
      },
      {
        title: 'UI/UX Design - Thiết kế giao diện người dùng chuyên nghiệp',
        description: 'Học các nguyên tắc thiết kế UI/UX từ cơ bản đến nâng cao. Thực hành với Figma, Adobe XD, tạo wireframes, prototypes, và design systems. Phù hợp cho người mới bắt đầu.',
        categoryId: 2, // Design
        price: 999000,
        level: 'Beginner',
        status: 'pending',
        language: 'vi'
      }
    ];
    
    let inserted = 0;
    
    for (const course of courses) {
      try {
        const result = await pool.request()
          .input('owner_instructor_id', sql.BigInt, 2)
          .input('category_id', sql.Int, course.categoryId)
          .input('title', sql.NVarChar, course.title)
          .input('description', sql.NVarChar, course.description)
          .input('language_code', sql.NVarChar, course.language)
          .input('level', sql.NVarChar, course.level)
          .input('price', sql.Decimal(10, 2), course.price)
          .input('status', sql.NVarChar, course.status)
          .query(`
            INSERT INTO courses (
              owner_instructor_id,
              category_id,
              title,
              description,
              language_code,
              level,
              price,
              status,
              created_at,
              updated_at
            )
            VALUES (
              @owner_instructor_id,
              @category_id,
              @title,
              @description,
              @language_code,
              @level,
              @price,
              @status,
              GETDATE(),
              GETDATE()
            )
          `);
        
        console.log(`✅ Inserted: ${course.title} (${course.status})`);
        inserted++;
        
      } catch (insertError) {
        console.error(`❌ Failed to insert "${course.title}":`, insertError.message);
      }
    }
    
    console.log(`\n✅ Successfully inserted ${inserted}/${courses.length} pending courses\n`);
    
    // Verify
    const pendingResult = await pool.request().query(`
      SELECT course_id, title, status, price
      FROM courses
      WHERE status IN ('pending', 'draft')
      ORDER BY created_at DESC
    `);
    
    console.log('📚 All pending/draft courses in database:');
    pendingResult.recordset.forEach(c => {
      console.log(`  - [${c.course_id}] ${c.title} (${c.status}) - ${new Intl.NumberFormat('vi-VN').format(c.price)} VND`);
    });
    
    console.log('\n🎯 Next steps:');
    console.log('  1. Open Admin Panel → Khóa học → Chờ duyệt');
    console.log('  2. You should see the new pending courses\n');
    
    await pool.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

insertPendingCourses();
