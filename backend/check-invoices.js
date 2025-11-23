import sql from 'mssql';

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  user: 'sa',
  password: '123456',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function checkInvoices() {
  try {
    await sql.connect(config);
    
    console.log('\n📋 INVOICES table columns:');
    const cols = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'invoices'
      ORDER BY ORDINAL_POSITION
    `);
    cols.recordset.forEach(col => {
      const len = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${len} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('\n📋 PAYMENTS table columns:');
    const payCols = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'payments'
      ORDER BY ORDINAL_POSITION
    `);
    payCols.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    await sql.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkInvoices();
