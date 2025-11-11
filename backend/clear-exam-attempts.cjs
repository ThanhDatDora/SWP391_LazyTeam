const path = require('path');

/**
 * clear-exam-attempts.cjs
 * Safe helper to preview and optionally delete exam_attempts rows.
 * Usage:
 *  node clear-exam-attempts.cjs --moocId=53 [--userId=5] [--olderMinutes=60] [--apply]
 * By default it only previews matching rows. Add --apply to perform deletion.
 */

async function main() {
  const argv = require('minimist')(process.argv.slice(2));
  const moocId = parseInt(argv.moocId || argv.moocID || argv.mooc || '53', 10);
  const userId = argv.userId ? parseInt(argv.userId, 10) : null;
  const olderMinutes = argv.olderMinutes ? parseInt(argv.olderMinutes, 10) : null;
  const doApply = !!argv.apply;

  let pool;
  try {
    const { pathToFileURL } = require('url');
    const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
    const getPool = dbMod.getPool;
    const sqlLib = dbMod.sql;
    pool = await getPool();

    let where = 'WHERE mooc_id = @moocId';
    if (userId) where += ' AND user_id = @userId';
    if (olderMinutes) where += ' AND started_at < DATEADD(minute, -@olderMinutes, GETDATE())';

    const previewSql = `SELECT TOP 50 attempt_id, user_id, mooc_id, started_at, submitted_at, score, passed FROM exam_attempts ${where} ORDER BY started_at DESC`;

    const previewReq = pool.request();
    previewReq.input('moocId', sqlLib.Int, moocId);
    if (userId) previewReq.input('userId', sqlLib.Int, userId);
    if (olderMinutes) previewReq.input('olderMinutes', sqlLib.Int, olderMinutes);

    console.log('🔎 Previewing matching exam_attempts (up to 50 rows):');
    const preview = await previewReq.query(previewSql);
    console.table(preview.recordset.map(r => ({ attempt_id: r.attempt_id, user_id: r.user_id, started_at: r.started_at, submitted_at: r.submitted_at, score: r.score, passed: r.passed })));
    console.log(`Total matched (preview limit 50 shown).`);

    if (!doApply) {
      console.log('\nℹ️ No changes made. Run with --apply to delete matching rows.');
      return;
    }

    // Perform delete in a transaction
    const transaction = new sqlLib.Transaction(pool);
    await transaction.begin();
    try {
      const trReq = transaction.request();
      trReq.input('moocId', sqlLib.Int, moocId);
      if (userId) trReq.input('userId', sqlLib.Int, userId);
      if (olderMinutes) trReq.input('olderMinutes', sqlLib.Int, olderMinutes);

      const deleteSql = `DELETE FROM exam_attempts ${where}`;
      const delResult = await trReq.query(deleteSql);
      console.log(`✅ Deleted rows: ${delResult.rowsAffected.reduce((a,b)=>a+b,0)}`);
      await transaction.commit();
    } catch (err) {
      console.error('❌ Error during delete, rolling back:', err.message || err);
      try { await transaction.rollback(); } catch(e){}
    }

  } catch (err) {
    console.error('❌ Error:', err.message || err);
  } finally {
    try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
  }
}

main();
