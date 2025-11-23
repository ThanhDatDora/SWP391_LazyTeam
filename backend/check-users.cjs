const sql = require("mssql");
const c = {user:"sa",password:"123456",server:"localhost",database:"MiniCoursera_Primary",options:{encrypt:false,trustServerCertificate:true}};
(async()=>{
  try{
    await sql.connect(c);
    const r = await sql.query`SELECT TOP 5 * FROM users WHERE role_id = 3`;
    console.log(" Learner Users:");
    if (r.recordset.length > 0) {
      console.log("Columns:", Object.keys(r.recordset[0]));
      r.recordset.forEach(u => console.log(`  ID: ${u.user_id}, Email: ${u.email}`));
    } else {
      console.log("No learners found");
    }
  }catch(e){console.error("",e.message);}finally{await sql.close();}
})();
