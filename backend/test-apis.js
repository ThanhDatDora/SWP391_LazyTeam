import { getPool } from './config/database.js';

async function testAPIs() {
  try {
    console.log('🧪 Testing APIs...');
    
    // Test categories
    console.log('\n📁 Testing categories API...');
    try {
      const categoriesResponse = await fetch('http://localhost:3001/api/courses/categories/list');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        console.log(`✅ Categories API: ${categoriesData.categories.length} categories found`);
        categoriesData.categories.slice(0, 3).forEach(cat => {
          console.log(`  - ${cat.name} (${cat.courseCount} courses)`);
        });
      } else {
        console.log(`❌ Categories API failed: ${categoriesResponse.status}`);
      }
    } catch (error) {
      console.log('❌ Categories API error:', error.message);
    }
    
    // Test courses
    console.log('\n📚 Testing courses API...');
    try {
      const coursesResponse = await fetch('http://localhost:3001/api/courses?limit=3');
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        console.log(`✅ Courses API: ${coursesData.courses.length} courses found`);
        coursesData.courses.forEach(course => {
          console.log(`  - ${course.title} ($${course.price}) - ${course.level}`);
        });
      } else {
        console.log(`❌ Courses API failed: ${coursesResponse.status}`);
      }
    } catch (error) {
      console.log('❌ Courses API error:', error.message);
    }
    
    // Direct database query test
    console.log('\n💾 Testing direct database queries...');
    const pool = await getPool();
    
    const coursesResult = await pool.request().query(`
      SELECT 
        c.course_id, c.title, c.price, c.level,
        cat.name as categoryName
      FROM courses c
      LEFT JOIN categories cat ON c.category_id = cat.category_id
      WHERE c.status = 'active'
      ORDER BY c.created_at DESC
    `);
    
    console.log(`✅ Direct DB query: ${coursesResult.recordset.length} courses found`);
    coursesResult.recordset.slice(0, 3).forEach(course => {
      console.log(`  - ${course.title} ($${course.price}) - ${course.categoryName}`);
    });
    
    console.log('\n🎉 API testing completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  }
}

testAPIs();