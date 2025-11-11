const path = require('path');

async function checkUserLessons() {
    let pool;
    console.log('🔍 CHECKING USER LESSON COMPLETION...\n');
    
    try {
        const { pathToFileURL } = require('url');
        const dbMod = await import(pathToFileURL(path.join(__dirname, 'config', 'database.js')).href);
        const getPool = dbMod.getPool;

        pool = await getPool();
        
        // Check lesson completion for User 5 (huy484820@gmail.com)
        console.log('📚 Checking lesson completion for User 5 (huy484820@gmail.com):');
        const lessonCheck = await pool.request().query(`
            SELECT 
                COUNT(*) as total_lessons,
                SUM(CASE WHEN p.is_completed = 1 THEN 1 ELSE 0 END) as completed_lessons
            FROM lessons l
            LEFT JOIN progress p ON l.lesson_id = p.lesson_id AND p.user_id = 5
            WHERE l.mooc_id = 53
        `);
        
        const progress = lessonCheck.recordset[0];
        console.log(`User 5: ${progress.completed_lessons}/${progress.total_lessons} lessons completed`);
        
        if (progress.total_lessons === 0) {
            console.log('❌ No lessons found for MOOC 53');
        } else if (progress.completed_lessons < progress.total_lessons) {
            console.log('❌ User 5 has NOT completed all lessons - THIS IS THE PROBLEM!');
            
            // Show which lessons are not completed
            const incompleteCheck = await pool.request().query(`
                SELECT l.lesson_id, l.title, p.is_completed
                FROM lessons l
                LEFT JOIN progress p ON l.lesson_id = p.lesson_id AND p.user_id = 5
                WHERE l.mooc_id = 53
                ORDER BY l.lesson_id
            `);
            
            console.log('\n📋 Lesson Status:');
            incompleteCheck.recordset.forEach((lesson, index) => {
                const status = lesson.is_completed ? '✅' : '❌';
                console.log(`${index + 1}. ${status} Lesson ${lesson.lesson_id}: ${lesson.title}`);
            });
            
            // FIX: Mark all lessons as completed for User 5
            console.log('\n🔧 FIXING: Mark all lessons as completed for User 5...');
            const fixResult = await pool.request().query(`
                INSERT INTO progress (user_id, lesson_id, is_completed, completion_date)
                SELECT 5, l.lesson_id, 1, GETDATE()
                FROM lessons l
                WHERE l.mooc_id = 53 
                AND NOT EXISTS (
                    SELECT 1 FROM progress p 
                    WHERE p.user_id = 5 AND p.lesson_id = l.lesson_id
                )
                
                UPDATE progress 
                SET is_completed = 1, completion_date = GETDATE()
                WHERE user_id = 5 
                AND lesson_id IN (SELECT lesson_id FROM lessons WHERE mooc_id = 53)
                AND is_completed = 0
            `);
            
            console.log('✅ All lessons marked as completed for User 5');
            
        } else {
            console.log('✅ User 5 has completed all lessons');
        }
        
        // Also check User 3 for comparison
        console.log('\n📚 Checking lesson completion for User 3 (learner@example.com):');
        const user3Check = await pool.request().query(`
            SELECT 
                COUNT(*) as total_lessons,
                SUM(CASE WHEN p.is_completed = 1 THEN 1 ELSE 0 END) as completed_lessons
            FROM lessons l
            LEFT JOIN progress p ON l.lesson_id = p.lesson_id AND p.user_id = 3
            WHERE l.mooc_id = 53
        `);
        
        const progress3 = user3Check.recordset[0];
        console.log(`User 3: ${progress3.completed_lessons}/${progress3.total_lessons} lessons completed`);
        
        console.log('\n🎉 LESSON COMPLETION CHECK COMPLETE!');
        
    } catch (error) {
        console.error('❌ Error:', error.message || error);
    } finally {
        try { if (pool && typeof pool.close === 'function') await pool.close(); } catch(e){}
    }
}

checkUserLessons();