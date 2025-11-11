const sql = require("mssql");
const bcrypt = require("bcryptjs");
const c = {user:"sa",password:"123456",server:"localhost",database:"MiniCoursera_Primary",options:{encrypt:false,trustServerCertificate:true}};

async function testPassword() {
  try {
    await sql.connect(c);
    const r = await sql.query`SELECT user_id, email, password_hash FROM users WHERE email = 'learner@example.com'`;
    
    if (r.recordset.length > 0) {
      const user = r.recordset[0];
      console.log("User found:", user.email);
      
      const testPass = "password";
      const match = await bcrypt.compare(testPass, user.password_hash);
      console.log(`Password "${testPass}" match:`, match);
      
      // Try common passwords
      const passwords = ["password", "123456", "admin123", "learner"];
      for (const pass of passwords) {
        const m = await bcrypt.compare(pass, user.password_hash);
        if (m) console.log(` Found password: "${pass}"`);
      }
    }
  } catch(e) {
    console.error("", e.message);
  } finally {
    await sql.close();
  }
}

testPassword();
