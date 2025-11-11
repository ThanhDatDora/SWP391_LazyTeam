import { getPool, sql } from './config/database.js';

async function insertMoreData() {
  try {
    const pool = await getPool();
    
    console.log('🚀 Inserting more sample data...');
    
    // 1. Insert more Categories
    console.log('📁 Adding more categories...');
    
    const newCategories = [
      'Web Development',
      'Data Science', 
      'Mobile Development',
      'AI & Machine Learning',
      'Business & Management',
      'Design',
      'Photography',
      'Marketing'
    ];
    
    for (const categoryName of newCategories) {
      // Check if category exists
      const existing = await pool.request()
        .input('name', sql.NVarChar, categoryName)
        .query('SELECT category_id FROM categories WHERE name = @name');
      
      if (existing.recordset.length === 0) {
        await pool.request()
          .input('name', sql.NVarChar, categoryName)
          .query('INSERT INTO categories (name) VALUES (@name)');
        console.log(`✅ Added category: ${categoryName}`);
      }
    }
    
    // Get all category IDs
    const categoriesResult = await pool.request().query('SELECT category_id, name FROM categories');
    const categoryMap = {};
    categoriesResult.recordset.forEach(cat => {
      categoryMap[cat.name] = cat.category_id;
    });
    
    // Get instructor ID
    const instructorResult = await pool.request().query('SELECT TOP 1 instructor_id FROM instructors');
    const instructorId = instructorResult.recordset[0].instructor_id;
    
    // 2. Insert more courses
    console.log('📚 Adding more courses...');
    
    const newCourses = [
      {
        title: 'Complete React Developer Course',
        description: 'Master React.js from basics to advanced concepts. Build real-world projects and learn modern development practices.',
        category: 'Web Development',
        price: 99.99,
        level: 'Intermediate',
        language_code: 'en'
      },
      {
        title: 'Python for Data Science',
        description: 'Learn Python programming and data analysis with pandas, numpy, and matplotlib. Perfect for beginners.',
        category: 'Data Science',
        price: 79.99,
        level: 'Beginner',
        language_code: 'en'
      },
      {
        title: 'Flutter Mobile App Development',
        description: 'Build cross-platform mobile apps with Flutter and Dart. Create beautiful, native apps for iOS and Android.',
        category: 'Mobile Development',
        price: 119.99,
        level: 'Intermediate',
        language_code: 'en'
      },
      {
        title: 'Machine Learning Fundamentals',
        description: 'Introduction to machine learning algorithms, supervised and unsupervised learning, and practical applications.',
        category: 'AI & Machine Learning',
        price: 149.99,
        level: 'Advanced',
        language_code: 'en'
      },
      {
        title: 'Digital Marketing Mastery',
        description: 'Complete guide to digital marketing including SEO, social media marketing, content marketing, and PPC.',
        category: 'Marketing',
        price: 69.99,
        level: 'Beginner',
        language_code: 'en'
      },
      {
        title: 'UI/UX Design Principles',
        description: 'Learn user interface and user experience design. Create stunning designs that users love.',
        category: 'Design',
        price: 89.99,
        level: 'Beginner',
        language_code: 'en'
      },
      {
        title: 'JavaScript ES6+ Modern Development',
        description: 'Master modern JavaScript including ES6+ features, async/await, modules, and best practices.',
        category: 'Web Development',
        price: 59.99,
        level: 'Intermediate',
        language_code: 'en'
      },
      {
        title: 'Photography Masterclass',
        description: 'Learn professional photography techniques, composition, lighting, and post-processing.',
        category: 'Photography',
        price: 79.99,
        level: 'Beginner',
        language_code: 'en'
      }
    ];
    
    const courseIds = [];
    
    for (const course of newCourses) {
      // Check if course exists
      const existing = await pool.request()
        .input('title', sql.NVarChar, course.title)
        .query('SELECT course_id FROM courses WHERE title = @title');
      
      if (existing.recordset.length === 0) {
        const categoryId = categoryMap[course.category];
        if (categoryId) {
          const result = await pool.request()
            .input('title', sql.NVarChar, course.title)
            .input('description', sql.NVarChar, course.description)
            .input('owner_instructor_id', sql.BigInt, instructorId)
            .input('category_id', sql.Int, categoryId)
            .input('price', sql.Decimal(10, 2), course.price)
            .input('level', sql.NVarChar, course.level)
            .input('language_code', sql.NVarChar, course.language_code)
            .input('status', sql.NVarChar, 'active')
            .input('created_at', sql.DateTime2, new Date())
            .input('updated_at', sql.DateTime2, new Date())
            .query(`
              INSERT INTO courses (
                title, description, owner_instructor_id, category_id, price, 
                level, language_code, status, created_at, updated_at
              )
              OUTPUT INSERTED.course_id
              VALUES (
                @title, @description, @owner_instructor_id, @category_id, @price,
                @level, @language_code, @status, @created_at, @updated_at
              )
            `);
          
          const courseId = result.recordset[0].course_id;
          courseIds.push(courseId);
          console.log(`✅ Added course: ${course.title}`);
        }
      }
    }
    
    // 3. Insert MOOCs for new courses
    console.log('📖 Adding MOOCs and lessons...');
    
    for (const courseId of courseIds) {
      const moocs = [
        { title: 'Introduction & Setup', order_no: 1 },
        { title: 'Core Concepts', order_no: 2 },
        { title: 'Practical Applications', order_no: 3 },
        { title: 'Advanced Topics', order_no: 4 },
        { title: 'Final Project', order_no: 5 }
      ];
      
      for (const mooc of moocs) {
        const moocResult = await pool.request()
          .input('course_id', sql.BigInt, courseId)
          .input('title', sql.NVarChar, mooc.title)
          .input('order_no', sql.Int, mooc.order_no)
          .query(`
            INSERT INTO moocs (course_id, title, order_no)
            OUTPUT INSERTED.mooc_id
            VALUES (@course_id, @title, @order_no)
          `);
        
        const moocId = moocResult.recordset[0].mooc_id;
        
        // Add lessons for this MOOC
        const lessons = [
          { title: 'Getting Started', content_type: 'text', content_url: 'introduction-and-setup.html', order_no: 1 },
          { title: 'Core Concepts', content_type: 'video', content_url: 'https://example.com/video1.mp4', order_no: 2 },
          { title: 'Hands-on Practice', content_type: 'text', content_url: 'practical-exercises.html', order_no: 3 },
          { title: 'Review & Assessment', content_type: 'quiz', content_url: 'quiz-1.json', order_no: 4 }
        ];
        
        for (const lesson of lessons) {
          await pool.request()
            .input('mooc_id', sql.BigInt, moocId)
            .input('title', sql.NVarChar, lesson.title)
            .input('content_type', sql.NVarChar, lesson.content_type)
            .input('content_url', sql.NVarChar, lesson.content_url)
            .input('order_no', sql.Int, lesson.order_no)
            .input('is_preview', sql.Bit, false)
            .query(`
              INSERT INTO lessons (mooc_id, title, content_type, content_url, order_no, is_preview)
              VALUES (@mooc_id, @title, @content_type, @content_url, @order_no, @is_preview)
            `);
        }
      }
    }
    
    // Final summary
    console.log('\n📊 Final Summary:');
    const finalCategoriesResult = await pool.request().query('SELECT COUNT(*) as count FROM categories');
    const finalCoursesResult = await pool.request().query('SELECT COUNT(*) as count FROM courses');
    const finalMoocsResult = await pool.request().query('SELECT COUNT(*) as count FROM moocs');
    const finalLessonsResult = await pool.request().query('SELECT COUNT(*) as count FROM lessons');
    
    console.log(`📁 Categories: ${finalCategoriesResult.recordset[0].count}`);
    console.log(`📚 Courses: ${finalCoursesResult.recordset[0].count}`);
    console.log(`📖 MOOCs: ${finalMoocsResult.recordset[0].count}`);
    console.log(`📝 Lessons: ${finalLessonsResult.recordset[0].count}`);
    
    console.log('\n🎉 More data inserted successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error inserting data:', error.message);
    process.exit(1);
  }
}

insertMoreData();