const sql = require("mssql");
const c = {user:"sa",password:"123456",server:"localhost",database:"MiniCoursera_Primary",options:{encrypt:false,trustServerCertificate:true}};
(async()=>{
  try{
    await sql.connect(c);
    const r = await sql.query`SELECT TOP 5 user_id, username, email, role FROM users WHERE role = 'learner'`;
    console.log(" Learner Users:");
    r.recordset.forEach(u => console.log(`  ${u.user_id}: ${u.username} (${u.email}) - ${u.role}`));
  }catch(e){console.error("",e.message);}finally{await sql.close();}
})();
