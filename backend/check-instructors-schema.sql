-- Check instructors table schema
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'instructors'
ORDER BY ORDINAL_POSITION;

-- Check if user_id column exists
SELECT COUNT(*) as column_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'instructors' 
  AND COLUMN_NAME = 'user_id';

-- Check actual column names (case-sensitive)
EXEC sp_columns 'instructors';
