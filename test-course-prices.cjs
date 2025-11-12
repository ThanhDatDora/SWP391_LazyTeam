const sql = require('mssql');
require('dotenv').config({ path: './backend/.env' });

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'MiniCoursera_Primary',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function checkCoursePrices() {
  try {
    console.log('\n🔍 Connecting to database...');
    await sql.connect(config);
    console.log('✅ Connected!\n');

    // Get all courses with prices
    const result = await sql.query`
      SELECT 
        course_id,
        title,
        price,
        status,
        owner_instructor_id,
        (SELECT full_name FROM users WHERE user_id = courses.owner_instructor_id) as instructor_name
      FROM courses
      ORDER BY course_id DESC
    `;

    console.log(`📚 Total courses found: ${result.recordset.length}\n`);
    console.log('📋 Course Details:\n');
    console.log('═'.repeat(120));
    console.log(
      'ID'.padEnd(6) +
      'Title'.padEnd(35) +
      'Instructor'.padEnd(25) +
      'Price (VND)'.padEnd(20) +
      'Status'.padEnd(15) +
      'Price Type'
    );
    console.log('═'.repeat(120));

    result.recordset.forEach(course => {
      const priceFormatted = course.price 
        ? course.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
        : '0 ₫';
      
      console.log(
        String(course.course_id).padEnd(6) +
        (course.title || 'N/A').substring(0, 34).padEnd(35) +
        (course.instructor_name || 'N/A').substring(0, 24).padEnd(25) +
        priceFormatted.padEnd(20) +
        (course.status || 'N/A').padEnd(15) +
        typeof course.price
      );
    });

    console.log('═'.repeat(120));
    console.log('\n📊 Price Statistics:');
    const prices = result.recordset.map(c => c.price || 0);
    console.log(`   Min: ${Math.min(...prices).toLocaleString('vi-VN')} VND`);
    console.log(`   Max: ${Math.max(...prices).toLocaleString('vi-VN')} VND`);
    console.log(`   Avg: ${(prices.reduce((a,b) => a+b, 0) / prices.length).toLocaleString('vi-VN')} VND`);

    await sql.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkCoursePrices();
