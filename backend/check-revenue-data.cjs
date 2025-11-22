const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'Thanhdatse172548',
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function checkData() {
  try {
    await sql.connect(config);
    console.log('✅ Connected to database\n');
    
    // Check enrollments
    const enrollments = await sql.query`
      SELECT COUNT(*) as total 
      FROM enrollments e
      JOIN courses c ON e.course_id = c.course_id
      WHERE c.owner_instructor_id = 2
    `;
    console.log(`📚 Enrollments for instructor ID=2: ${enrollments.recordset[0].total}`);
    
    // Check invoices
    const invoices = await sql.query`
      SELECT COUNT(*) as total 
      FROM invoices i
      JOIN enrollments e ON i.enrollment_id = e.enrollment_id
      JOIN courses c ON e.course_id = c.course_id
      WHERE c.owner_instructor_id = 2
    `;
    console.log(`📄 Invoices: ${invoices.recordset[0].total}`);
    
    // Check payments
    const payments = await sql.query`
      SELECT COUNT(*) as total, SUM(p.amount) as total_amount
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.invoice_id
      JOIN enrollments e ON i.enrollment_id = e.enrollment_id
      JOIN courses c ON e.course_id = c.course_id
      WHERE c.owner_instructor_id = 2 AND p.status = 'paid'
    `;
    console.log(`💰 Paid payments: ${payments.recordset[0].total}`);
    console.log(`💵 Total revenue: $${payments.recordset[0].total_amount || 0}`);
    console.log(`👨‍🏫 Instructor share (80%): $${(payments.recordset[0].total_amount || 0) * 0.8}\n`);
    
    // Sample enrollments
    const sampleEnrollments = await sql.query`
      SELECT TOP 5 
        c.title,
        e.enrollment_id,
        e.enrolled_at
      FROM enrollments e
      JOIN courses c ON e.course_id = c.course_id
      WHERE c.owner_instructor_id = 2
      ORDER BY e.enrolled_at DESC
    `;
    
    if (sampleEnrollments.recordset.length > 0) {
      console.log('📋 Sample enrollments:');
      sampleEnrollments.recordset.forEach(row => {
        console.log(`  - ${row.title} (ID: ${row.enrollment_id}, ${new Date(row.enrolled_at).toLocaleDateString()})`);
      });
    } else {
      console.log('⚠️ No enrollments found for instructor ID=2');
    }
    
    await sql.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    await sql.close();
  }
}

checkData();
