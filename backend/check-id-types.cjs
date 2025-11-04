const sql = require("mssql");
const c = {user:"sa",password:"123456",server:"localhost",database:"MiniCoursera_Primary",options:{encrypt:false,trustServerCertificate:true}};
(async()=>{
  try{
    await sql.connect(c);
    const r = await sql.query`
      SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME IN ('users', 'moocs')
      AND COLUMN_NAME IN ('user_id', 'mooc_id')
      ORDER BY TABLE_NAME, COLUMN_NAME
    `;
    console.log(" Data Types:");
    r.recordset.forEach(row => {
      console.log(`${row.TABLE_NAME}.${row.COLUMN_NAME}: ${row.DATA_TYPE}${row.CHARACTER_MAXIMUM_LENGTH ? '(' + row.CHARACTER_MAXIMUM_LENGTH + ')' : ''}`);
    });
  }catch(e){console.error("",e.message);}finally{await sql.close();}
})();
