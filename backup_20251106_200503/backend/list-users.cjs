const path = require('path');

(async () => {
  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, '..', '..', 'backend', 'config', 'database.js')).href).catch(async () => {
      return await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    });
    const getPool = dbMod.getPool;
    pool = await getPool();
  
    const users = await pool.request()
      .query('SELECT TOP 10 user_id, full_name, email FROM users ORDER BY user_id');
    
    console.log('👥 Users in database:');
    console.log('================================\n');
    users.recordset.forEach(u => {
      console.log(`${u.user_id}: ${u.full_name}`);
      console.log(`   📧 ${u.email}\n`);
    });
    
  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
  }
})();
