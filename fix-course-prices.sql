-- Fix course prices (currently showing 1 VND)
-- Update this SQL to set correct prices for your courses

-- Check current prices first
SELECT course_id, title, price 
FROM courses 
WHERE price < 1000
ORDER BY course_id;

-- Update Python course price (change 299000 to your desired price)
UPDATE courses 
SET price = 299000 
WHERE course_id = 16;

-- Update other courses if needed (add more UPDATE statements)
-- UPDATE courses SET price = 499000 WHERE course_id = 17;
-- UPDATE courses SET price = 199000 WHERE course_id = 18;

-- Verify changes
SELECT course_id, title, price, 
       FORMAT(price, 'N0', 'vi-VN') as formatted_price
FROM courses 
WHERE course_id IN (16, 17, 18)
ORDER BY course_id;
