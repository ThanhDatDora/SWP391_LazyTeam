const sql = require("mssql");
const c = {user:"sa",password:"123456",server:"localhost",database:"MiniCoursera_Primary",options:{encrypt:false,trustServerCertificate:true}};

async function enrollTestUser() {
  try {
    await sql.connect(c);
    
    const userResult = await sql.query`SELECT user_id FROM users WHERE email = 'test-learner@exam.com'`;
    if (userResult.recordset.length === 0) {
      console.log(" Test user not found");
      return;
    }
    const userId = userResult.recordset[0].user_id;
    
    const check = await sql.query`SELECT * FROM enrollments WHERE user_id = ${userId} AND course_id = 2`;
    if (check.recordset.length > 0) {
      console.log(" Already enrolled in Course 2");
      return;
    }
    
    await sql.query`
      INSERT INTO enrollments (user_id, course_id, enrolled_at, status)
      VALUES (${userId}, 2, GETDATE(), 'active')
    `;
    
    console.log(" Enrolled test user in Course 2 (React)");
    
  } catch(e) {
    console.error("", e.message);
  } finally {
    await sql.close();
  }
}

enrollTestUser();
