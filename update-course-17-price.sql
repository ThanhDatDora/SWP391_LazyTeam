-- Update price for course ID 17 (HTML & CSS tu Zero den Hero)
-- Current price: 0.75 USD
-- New price: 250,000 VND (equivalent to ~10 USD)

USE MiniCoursera_Primary;
GO

-- Check current price
SELECT course_id, title, price 
FROM courses 
WHERE course_id = 17;
GO

-- Update to 250,000 VND
UPDATE courses 
SET price = 250000
WHERE course_id = 17;
GO

-- Verify update
SELECT course_id, title, price 
FROM courses 
WHERE course_id = 17;
GO
