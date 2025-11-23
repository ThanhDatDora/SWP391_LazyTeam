import sql from 'mssql';

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  user: 'sa',
  password: '123456',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function checkPaymentTables() {
  try {
    await sql.connect(config);
    
    // Check all tables
    console.log('\n📊 All tables in database:');
    const tables = await sql.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    tables.recordset.forEach(table => console.log(`  - ${table.TABLE_NAME}`));
    
    // Check if orders/payments table exists
    const orderTables = tables.recordset.filter(t => 
      t.TABLE_NAME.toLowerCase().includes('order') || 
      t.TABLE_NAME.toLowerCase().includes('payment') ||
      t.TABLE_NAME.toLowerCase().includes('transaction')
    );
    
    if (orderTables.length > 0) {
      console.log('\n✅ Found payment-related tables:');
      for (const table of orderTables) {
        console.log(`\n📋 ${table.TABLE_NAME} columns:`);
        const columns = await sql.query(`
          SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = '${table.TABLE_NAME}'
          ORDER BY ORDINAL_POSITION
        `);
        columns.recordset.forEach(col => 
          console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'})`)
        );
      }
    } else {
      console.log('\n⚠️ No order/payment tables found. Need to create them.');
    }
    
    await sql.close();
    console.log('\n✅ Done');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkPaymentTables();
