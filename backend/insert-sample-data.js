import { getPool, sql } from './config/database.js';

async function insertSampleData() {
  try {
    const pool = await getPool();
    
    console.log('🚀 Starting data insertion...');
    
    // 1. Insert Categories
    console.log('📁 Inserting categories...');
    
    const categories = [
      { name: 'Web Development' },
      { name: 'Data Science' },
      { name: 'Mobile Development' },
      { name: 'AI & Machine Learning' },
      { name: 'Business & Management' },
      { name: 'Design' },
      { name: 'Photography' },
      { name: 'Marketing' }
    ];
    
    // Check if categories already exist
    const existingCategoriesResult = await pool.request().query('SELECT COUNT(*) as count FROM categories');
    const existingCategoriesCount = existingCategoriesResult.recordset[0].count;
    
    if (existingCategoriesCount === 0) {
      for (const category of categories) {
        await pool.request()
          .input('name', sql.NVarChar, category.name)
          .query('INSERT INTO categories (name) VALUES (@name)');
      }
      console.log(`✅ Inserted ${categories.length} categories`);
    } else {
      console.log(`ℹ️ Categories already exist (${existingCategoriesCount} found)`);
    }
    
    // Get category IDs
    const categoriesResult = await pool.request().query('SELECT category_id, name FROM categories');
    const categoryMap = {};
    categoriesResult.recordset.forEach(cat => {
      categoryMap[cat.name] = cat.category_id;
    });
    
    // 2. Check if we have instructors
    console.log('👨‍🏫 Checking instructors...');
    const instructorsResult = await pool.request().query(`
      SELECT instructor_id FROM instructors
    `);
    
    if (instructorsResult.recordset.length === 0) {
      console.log('❌ No instructors found. Need to create one manually.');
      console.log('Please create an instructor record first.');
      process.exit(1);
    } else {
      console.log(`ℹ️ Found ${instructorsResult.recordset.length} instructors`);
    }
    
    // Get first instructor ID  
    const instructorId = instructorsResult.recordset[0].instructor_id;
    
    // 3. Insert Sample Courses
    console.log('📚 Inserting courses...');
    
    const sampleCourses = [
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
      }
    ];
    
    // Check if courses already exist
    const existingCoursesResult = await pool.request().query('SELECT COUNT(*) as count FROM courses');
    const existingCoursesCount = existingCoursesResult.recordset[0].count;
    
    if (existingCoursesCount === 0) {
      const courseIds = [];
      
      for (const course of sampleCourses) {
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
          
          courseIds.push(result.recordset[0].course_id);
        }
      }
      
      console.log(`✅ Inserted ${courseIds.length} courses`);
      
      // 4. Insert MOOCs for each course
      console.log('📖 Inserting MOOCs...');
      
      let totalMoocs = 0;
      for (const courseId of courseIds) {
        const moocs = [
          { title: 'Introduction & Setup', order_no: 1 },
          { title: 'Core Concepts', order_no: 2 },
          { title: 'Practical Applications', order_no: 3 },
          { title: 'Advanced Topics', order_no: 4 },
          { title: 'Final Project', order_no: 5 }
        ];
        
        const moocIds = [];
        for (const mooc of moocs) {
          const result = await pool.request()
            .input('course_id', sql.BigInt, courseId)
            .input('title', sql.NVarChar, mooc.title)
            .input('order_no', sql.Int, mooc.order_no)
            .query(`
              INSERT INTO moocs (course_id, title, order_no)
              OUTPUT INSERTED.mooc_id
              VALUES (@course_id, @title, @order_no)
            `);
          
          moocIds.push(result.recordset[0].mooc_id);
        }
        
        totalMoocs += moocIds.length;
        
        // 5. Insert Lessons for each MOOC
        let totalLessons = 0;
        for (const moocId of moocIds) {
          const lessons = [
            { title: 'Lesson 1: Getting Started', content: 'Introduction to the topic and initial setup.', order_no: 1 },
            { title: 'Lesson 2: Basic Concepts', content: 'Understanding the fundamental concepts.', order_no: 2 },
            { title: 'Lesson 3: Hands-on Practice', content: 'Practical exercises and examples.', order_no: 3 },
            { title: 'Lesson 4: Review & Quiz', content: 'Review of concepts and knowledge check.', order_no: 4 }
          ];
          
          for (const lesson of lessons) {
            await pool.request()
              .input('mooc_id', sql.BigInt, moocId)
              .input('title', sql.NVarChar, lesson.title)
              .input('content', sql.NVarChar, lesson.content)
              .input('order_no', sql.Int, lesson.order_no)
              .query(`
                INSERT INTO lessons (mooc_id, title, content, order_no)
                VALUES (@mooc_id, @title, @content, @order_no)
              `);
            
            totalLessons++;
          }
        }
        
        console.log(`📖 Inserted ${moocIds.length} MOOCs and ${totalLessons} lessons for course ${courseId}`);
      }
      
      console.log(`✅ Total: ${totalMoocs} MOOCs and lessons inserted`);
      
    } else {
      console.log(`ℹ️ Courses already exist (${existingCoursesCount} found)`);
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
    
    console.log('\n🎉 Data insertion completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error inserting data:', error);
    console.error('Full error:', error.message);
    process.exit(1);
  }
}

insertSampleData();