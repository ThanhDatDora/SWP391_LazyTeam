import { getPool } from './config/database.js';
import sql from 'mssql';

async function insertExamQuestions() {
  try {
    const pool = await getPool();
    
    console.log('🚀 Inserting exam questions for Photography course...\n');

    // 1. Get Photography course and its MOOC
    const moocResult = await pool.request().query(`
      SELECT TOP 1 m.mooc_id, m.title, c.title as course_title
      FROM moocs m
      JOIN courses c ON m.course_id = c.course_id
      WHERE c.title LIKE '%Photography%'
      ORDER BY m.mooc_id
    `);

    if (moocResult.recordset.length === 0) {
      console.log('❌ No Photography MOOC found');
      return;
    }

    const mooc = moocResult.recordset[0];
    console.log(`✅ Found MOOC: ${mooc.title} (ID: ${mooc.mooc_id})\n`);

    // 2. Create exam if not exists
    console.log('📝 Creating/finding exam...');
    
    let examResult = await pool.request()
      .input('moocId', sql.BigInt, mooc.mooc_id)
      .query(`
        SELECT exam_id FROM exams WHERE mooc_id = @moocId
      `);

    let examId;
    if (examResult.recordset.length > 0) {
      examId = examResult.recordset[0].exam_id;
      console.log(`✅ Found existing exam (ID: ${examId})\n`);
    } else {
      const newExam = await pool.request()
        .input('moocId', sql.BigInt, mooc.mooc_id)
        .input('name', sql.NVarChar, 'Photography Fundamentals - Final Exam')
        .input('duration', sql.Int, 60)
        .input('attempts', sql.Int, 2)
        .query(`
          INSERT INTO exams (mooc_id, name, duration_minutes, attempts_allowed, created_at)
          OUTPUT INSERTED.exam_id
          VALUES (@moocId, @name, @duration, @attempts, GETDATE())
        `);
      examId = newExam.recordset[0].exam_id;
      console.log(`✅ Created new exam (ID: ${examId})\n`);
    }

    // 3. Clear existing questions for this MOOC
    console.log('🗑️  Clearing old questions...');
    await pool.request()
      .input('moocId', sql.BigInt, mooc.mooc_id)
      .query(`
        DELETE FROM exam_items WHERE question_id IN (
          SELECT question_id FROM questions WHERE mooc_id = @moocId
        );
        DELETE FROM question_options WHERE question_id IN (
          SELECT question_id FROM questions WHERE mooc_id = @moocId
        );
        DELETE FROM questions WHERE mooc_id = @moocId;
      `);
    console.log('✅ Cleared\n');

    // 4. Insert 60 questions (20 easy, 25 medium, 15 hard)
    console.log('📚 Inserting question bank...\n');

    const questions = [
      // ========== EASY QUESTIONS (20) ==========
      {
        stem: 'What does "ISO" stand for in photography?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: 'International Standards Organization', is_correct: true },
          { label: 'B', content: 'Image Sensor Output', is_correct: false },
          { label: 'C', content: 'Internal Shutter Operation', is_correct: false },
          { label: 'D', content: 'Illumination Sensitivity Option', is_correct: false }
        ]
      },
      {
        stem: 'Which camera setting controls the amount of light entering the lens?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: 'Aperture', is_correct: true },
          { label: 'B', content: 'Focus', is_correct: false },
          { label: 'C', content: 'White Balance', is_correct: false },
          { label: 'D', content: 'Metering Mode', is_correct: false }
        ]
      },
      {
        stem: 'What are the three components of the exposure triangle?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: 'ISO, Aperture, Shutter Speed', is_correct: true },
          { label: 'B', content: 'Focus, Zoom, Flash', is_correct: false },
          { label: 'C', content: 'Camera, Lens, Tripod', is_correct: false },
          { label: 'D', content: 'Red, Green, Blue', is_correct: false }
        ]
      },
      {
        stem: 'A lower f-number (like f/1.8) means:',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: 'Wider aperture, more light', is_correct: true },
          { label: 'B', content: 'Narrower aperture, less light', is_correct: false },
          { label: 'C', content: 'Faster shutter speed', is_correct: false },
          { label: 'D', content: 'Lower ISO sensitivity', is_correct: false }
        ]
      },
      {
        stem: 'Which shutter speed is best for freezing fast motion?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: '1/1000 second', is_correct: true },
          { label: 'B', content: '1/30 second', is_correct: false },
          { label: 'C', content: '1 second', is_correct: false },
          { label: 'D', content: '10 seconds', is_correct: false }
        ]
      },
      {
        stem: 'What does "bokeh" refer to in photography?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: 'The aesthetic quality of blur in out-of-focus areas', is_correct: true },
          { label: 'B', content: 'A type of camera lens', is_correct: false },
          { label: 'C', content: 'Motion blur effect', is_correct: false },
          { label: 'D', content: 'Camera shake', is_correct: false }
        ]
      },
      {
        stem: 'The Rule of Thirds divides an image into:',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: '9 equal parts (3x3 grid)', is_correct: true },
          { label: 'B', content: '4 equal parts (2x2 grid)', is_correct: false },
          { label: 'C', content: '6 equal parts (2x3 grid)', is_correct: false },
          { label: 'D', content: '16 equal parts (4x4 grid)', is_correct: false }
        ]
      },
      {
        stem: 'Which file format retains the most image data?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: 'RAW', is_correct: true },
          { label: 'B', content: 'JPEG', is_correct: false },
          { label: 'C', content: 'PNG', is_correct: false },
          { label: 'D', content: 'GIF', is_correct: false }
        ]
      },
      {
        stem: 'What is the main advantage of a mirrorless camera over DSLR?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: 'Smaller and lighter body', is_correct: true },
          { label: 'B', content: 'Longer battery life', is_correct: false },
          { label: 'C', content: 'More lens options', is_correct: false },
          { label: 'D', content: 'Better image quality', is_correct: false }
        ]
      },
      {
        stem: 'Which ISO setting produces the least amount of noise?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: 'ISO 100', is_correct: true },
          { label: 'B', content: 'ISO 800', is_correct: false },
          { label: 'C', content: 'ISO 3200', is_correct: false },
          { label: 'D', content: 'ISO 6400', is_correct: false }
        ]
      },
      {
        stem: 'What is the "Golden Hour" in photography?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: 'The hour after sunrise or before sunset', is_correct: true },
          { label: 'B', content: 'Noon when the sun is highest', is_correct: false },
          { label: 'C', content: 'Any time between 12pm-1pm', is_correct: false },
          { label: 'D', content: 'The first hour of shooting', is_correct: false }
        ]
      },
      {
        stem: 'Which lens focal length is considered "standard" for full-frame cameras?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: '50mm', is_correct: true },
          { label: 'B', content: '24mm', is_correct: false },
          { label: 'C', content: '85mm', is_correct: false },
          { label: 'D', content: '200mm', is_correct: false }
        ]
      },
      {
        stem: 'What does "chromatic aberration" refer to?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: 'Color fringing around high-contrast edges', is_correct: true },
          { label: 'B', content: 'Overall color cast in an image', is_correct: false },
          { label: 'C', content: 'Black and white conversion', is_correct: false },
          { label: 'D', content: 'Saturation levels', is_correct: false }
        ]
      },
      {
        stem: 'Which metering mode measures light from the entire frame?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: 'Evaluative/Matrix metering', is_correct: true },
          { label: 'B', content: 'Spot metering', is_correct: false },
          { label: 'C', content: 'Center-weighted metering', is_correct: false },
          { label: 'D', content: 'Partial metering', is_correct: false }
        ]
      },
      {
        stem: 'What is "depth of field"?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: 'The distance range that appears sharp in an image', is_correct: true },
          { label: 'B', content: 'The focal length of a lens', is_correct: false },
          { label: 'C', content: 'The distance from camera to subject', is_correct: false },
          { label: 'D', content: 'The size of the camera sensor', is_correct: false }
        ]
      },
      {
        stem: 'Which white balance setting is represented by approximately 5500K?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: 'Daylight', is_correct: true },
          { label: 'B', content: 'Tungsten', is_correct: false },
          { label: 'C', content: 'Fluorescent', is_correct: false },
          { label: 'D', content: 'Shade', is_correct: false }
        ]
      },
      {
        stem: 'What is the main purpose of a polarizing filter?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: 'Reduce reflections and enhance colors', is_correct: true },
          { label: 'B', content: 'Protect the lens from damage', is_correct: false },
          { label: 'C', content: 'Allow longer exposures', is_correct: false },
          { label: 'D', content: 'Magnify the subject', is_correct: false }
        ]
      },
      {
        stem: 'In portrait photography, which aperture creates the most background blur?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: 'f/1.4', is_correct: true },
          { label: 'B', content: 'f/8', is_correct: false },
          { label: 'C', content: 'f/16', is_correct: false },
          { label: 'D', content: 'f/22', is_correct: false }
        ]
      },
      {
        stem: 'What does "overexposed" mean?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: 'Too much light, image too bright', is_correct: true },
          { label: 'B', content: 'Too little light, image too dark', is_correct: false },
          { label: 'C', content: 'Out of focus', is_correct: false },
          { label: 'D', content: 'Motion blur present', is_correct: false }
        ]
      },
      {
        stem: 'Which camera mode gives you full control over all settings?',
        qtype: 'mcq',
        difficulty: 'easy',
        max_score: 1,
        options: [
          { label: 'A', content: 'Manual (M)', is_correct: true },
          { label: 'B', content: 'Auto', is_correct: false },
          { label: 'C', content: 'Program (P)', is_correct: false },
          { label: 'D', content: 'Scene Mode', is_correct: false }
        ]
      },

      // ========== MEDIUM QUESTIONS (25) ==========
      {
        stem: 'If you increase ISO from 100 to 400, you need to adjust shutter speed or aperture how?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Decrease by 2 stops to maintain same exposure', is_correct: true },
          { label: 'B', content: 'Increase by 2 stops to maintain same exposure', is_correct: false },
          { label: 'C', content: 'No adjustment needed', is_correct: false },
          { label: 'D', content: 'Decrease by 1 stop only', is_correct: false }
        ]
      },
      {
        stem: 'What is the relationship between f-stops and aperture size?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Higher f-number = smaller aperture opening', is_correct: true },
          { label: 'B', content: 'Higher f-number = larger aperture opening', is_correct: false },
          { label: 'C', content: 'F-number does not affect aperture size', is_correct: false },
          { label: 'D', content: 'F-number only affects shutter speed', is_correct: false }
        ]
      },
      {
        stem: 'Which factors affect depth of field? (Select all that apply)',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Aperture', is_correct: true },
          { label: 'B', content: 'Focal length', is_correct: true },
          { label: 'C', content: 'Distance to subject', is_correct: true },
          { label: 'D', content: 'ISO setting', is_correct: false }
        ]
      },
      {
        stem: 'In Aperture Priority mode (A/Av), what does the camera automatically control?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Shutter speed', is_correct: true },
          { label: 'B', content: 'ISO', is_correct: false },
          { label: 'C', content: 'White balance', is_correct: false },
          { label: 'D', content: 'Focus point', is_correct: false }
        ]
      },
      {
        stem: 'What is the "reciprocal rule" for handheld shooting?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Shutter speed should be at least 1/focal length', is_correct: true },
          { label: 'B', content: 'Aperture should match focal length', is_correct: false },
          { label: 'C', content: 'ISO should equal focal length', is_correct: false },
          { label: 'D', content: 'F-stop should be 1/focal length', is_correct: false }
        ]
      },
      {
        stem: 'What effect does increasing focal length have on depth of field?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Decreases depth of field (shallower)', is_correct: true },
          { label: 'B', content: 'Increases depth of field (deeper)', is_correct: false },
          { label: 'C', content: 'No effect on depth of field', is_correct: false },
          { label: 'D', content: 'Only affects sharpness', is_correct: false }
        ]
      },
      {
        stem: 'Which histogram indicates a properly exposed image?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Bell curve centered with no clipping', is_correct: true },
          { label: 'B', content: 'All data pushed to the right edge', is_correct: false },
          { label: 'C', content: 'All data pushed to the left edge', is_correct: false },
          { label: 'D', content: 'Flat line across the middle', is_correct: false }
        ]
      },
      {
        stem: 'What is "back-button focus"?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Separating focus from shutter button using AF-ON button', is_correct: true },
          { label: 'B', content: 'Focusing on the background instead of foreground', is_correct: false },
          { label: 'C', content: 'Using rear LCD screen for focusing', is_correct: false },
          { label: 'D', content: 'Manual focus mode', is_correct: false }
        ]
      },
      {
        stem: 'What is "exposure compensation"?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Overriding camera metering to make image brighter/darker', is_correct: true },
          { label: 'B', content: 'Changing white balance', is_correct: false },
          { label: 'C', content: 'Adjusting lens focal length', is_correct: false },
          { label: 'D', content: 'Post-processing brightness adjustment', is_correct: false }
        ]
      },
      {
        stem: 'Which lens type is best for landscape photography?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Wide-angle (16-35mm)', is_correct: true },
          { label: 'B', content: 'Telephoto (70-200mm)', is_correct: false },
          { label: 'C', content: 'Macro (90-105mm)', is_correct: false },
          { label: 'D', content: 'Fish-eye (8mm)', is_correct: false }
        ]
      },
      {
        stem: 'What is "bracketing" in photography?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Taking multiple shots at different exposures', is_correct: true },
          { label: 'B', content: 'Using a tripod bracket', is_correct: false },
          { label: 'C', content: 'Framing your subject', is_correct: false },
          { label: 'D', content: 'Adding borders in post-processing', is_correct: false }
        ]
      },
      {
        stem: 'What does "diffraction" mean in photography?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Loss of sharpness at very small apertures (f/16-f/22)', is_correct: true },
          { label: 'B', content: 'Light spreading in fog or mist', is_correct: false },
          { label: 'C', content: 'Reflection off water or glass', is_correct: false },
          { label: 'D', content: 'Lens flare from bright light', is_correct: false }
        ]
      },
      {
        stem: 'Which autofocus mode is best for moving subjects?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Continuous AF (AI Servo/AF-C)', is_correct: true },
          { label: 'B', content: 'Single AF (One Shot/AF-S)', is_correct: false },
          { label: 'C', content: 'Manual Focus', is_correct: false },
          { label: 'D', content: 'Face Detection', is_correct: false }
        ]
      },
      {
        stem: 'What is "panning" technique used for?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Following a moving subject with camera to blur background', is_correct: true },
          { label: 'B', content: 'Rotating camera for vertical shots', is_correct: false },
          { label: 'C', content: 'Sweeping across a landscape', is_correct: false },
          { label: 'D', content: 'Adjusting tripod position', is_correct: false }
        ]
      },
      {
        stem: 'What is the advantage of shooting in RAW format?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Maximum editing flexibility with unprocessed data', is_correct: true },
          { label: 'B', content: 'Smaller file size', is_correct: false },
          { label: 'C', content: 'Faster shooting speed', is_correct: false },
          { label: 'D', content: 'Better for web sharing', is_correct: false }
        ]
      },
      {
        stem: 'What is "lens compression"?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Telephoto lenses making background appear closer to subject', is_correct: true },
          { label: 'B', content: 'Wide-angle lenses making things look stretched', is_correct: false },
          { label: 'C', content: 'Flattening 3D objects into 2D photos', is_correct: false },
          { label: 'D', content: 'Reducing file size in camera', is_correct: false }
        ]
      },
      {
        stem: 'What is "fill flash" used for?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Lighting shadows in bright daylight scenes', is_correct: true },
          { label: 'B', content: 'Main light source in dark environments', is_correct: false },
          { label: 'C', content: 'Creating lens flare effects', is_correct: false },
          { label: 'D', content: 'Freezing fast motion', is_correct: false }
        ]
      },
      {
        stem: 'What does "dynamic range" refer to?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Range between darkest and brightest tones a sensor can capture', is_correct: true },
          { label: 'B', content: 'Range of focal lengths a lens can achieve', is_correct: false },
          { label: 'C', content: 'Speed range of camera autofocus', is_correct: false },
          { label: 'D', content: 'ISO sensitivity range', is_correct: false }
        ]
      },
      {
        stem: 'Which composition technique creates depth by showing foreground, midground, and background?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Layering', is_correct: true },
          { label: 'B', content: 'Rule of Thirds', is_correct: false },
          { label: 'C', content: 'Symmetry', is_correct: false },
          { label: 'D', content: 'Framing', is_correct: false }
        ]
      },
      {
        stem: 'What is "high-key" lighting?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Bright, low-contrast lighting with minimal shadows', is_correct: true },
          { label: 'B', content: 'Dark, moody lighting with deep shadows', is_correct: false },
          { label: 'C', content: 'Backlighting only', is_correct: false },
          { label: 'D', content: 'Using only natural light', is_correct: false }
        ]
      },
      {
        stem: 'What is "vignetting"?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Darkening of image corners', is_correct: true },
          { label: 'B', content: 'Blurring of image edges', is_correct: false },
          { label: 'C', content: 'Color shift in highlights', is_correct: false },
          { label: 'D', content: 'Lens flare artifacts', is_correct: false }
        ]
      },
      {
        stem: 'What is the "Sunny 16" rule?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'On sunny day: f/16, shutter speed = 1/ISO', is_correct: true },
          { label: 'B', content: 'Always shoot at f/16 for landscapes', is_correct: false },
          { label: 'C', content: 'ISO should be 1600 in sunny conditions', is_correct: false },
          { label: 'D', content: 'Shoot 16 frames in burst mode', is_correct: false }
        ]
      },
      {
        stem: 'What is "tethered shooting"?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Camera connected to computer, images appear instantly on screen', is_correct: true },
          { label: 'B', content: 'Using a remote trigger', is_correct: false },
          { label: 'C', content: 'Shooting with camera on tripod', is_correct: false },
          { label: 'D', content: 'Wi-Fi enabled camera', is_correct: false }
        ]
      },
      {
        stem: 'What causes "motion blur" in photos?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'Shutter speed too slow for moving subject', is_correct: true },
          { label: 'B', content: 'Aperture too wide', is_correct: false },
          { label: 'C', content: 'ISO too high', is_correct: false },
          { label: 'D', content: 'Lens out of focus', is_correct: false }
        ]
      },
      {
        stem: 'What is "focal plane"?',
        qtype: 'mcq',
        difficulty: 'medium',
        max_score: 2,
        options: [
          { label: 'A', content: 'The plane where focused light converges in the camera', is_correct: true },
          { label: 'B', content: 'The front element of the lens', is_correct: false },
          { label: 'C', content: 'The LCD screen', is_correct: false },
          { label: 'D', content: 'The tripod mounting plate', is_correct: false }
        ]
      },

      // ========== HARD QUESTIONS (15) ==========
      {
        stem: 'Calculate the hyperfocal distance: 50mm lens, f/8, circle of confusion 0.03mm. What is the hyperfocal distance?',
        qtype: 'mcq',
        difficulty: 'hard',
        max_score: 3,
        options: [
          { label: 'A', content: 'Approximately 10.4 meters', is_correct: true },
          { label: 'B', content: 'Approximately 5.2 meters', is_correct: false },
          { label: 'C', content: 'Approximately 20.8 meters', is_correct: false },
          { label: 'D', content: 'Approximately 15.6 meters', is_correct: false }
        ]
      },
      {
        stem: 'In a 3-light studio setup, what is the purpose of the "rim light" or "hair light"?',
        qtype: 'mcq',
        difficulty: 'hard',
        max_score: 3,
        options: [
          { label: 'A', content: 'Separate subject from background by highlighting edges', is_correct: true },
          { label: 'B', content: 'Provide main illumination on subject', is_correct: false },
          { label: 'C', content: 'Fill in shadows created by key light', is_correct: false },
          { label: 'D', content: 'Illuminate the background evenly', is_correct: false }
        ]
      },
      {
        stem: 'What is the "Scheimpflug principle" used for?',
        qtype: 'mcq',
        difficulty: 'hard',
        max_score: 3,
        options: [
          { label: 'A', content: 'Achieving focus across a tilted plane using tilt-shift lenses', is_correct: true },
          { label: 'B', content: 'Calculating optimal aperture for landscapes', is_correct: false },
          { label: 'C', content: 'Determining correct white balance', is_correct: false },
          { label: 'D', content: 'Measuring light falloff', is_correct: false }
        ]
      },
      {
        stem: 'What is "bayer filter" in digital sensors?',
        qtype: 'mcq',
        difficulty: 'hard',
        max_score: 3,
        options: [
          { label: 'A', content: 'Color filter array pattern (50% green, 25% red, 25% blue)', is_correct: true },
          { label: 'B', content: 'UV filter built into sensor', is_correct: false },
          { label: 'C', content: 'Anti-aliasing filter', is_correct: false },
          { label: 'D', content: 'Noise reduction algorithm', is_correct: false }
        ]
      },
      {
        stem: 'In flash photography, what is "high-speed sync" (HSS)?',
        qtype: 'mcq',
        difficulty: 'hard',
        max_score: 3,
        options: [
          { label: 'A', content: 'Using flash at shutter speeds faster than X-sync (e.g., 1/8000s)', is_correct: true },
          { label: 'B', content: 'Flash recycles faster between shots', is_correct: false },
          { label: 'C', content: 'Flash duration is shorter', is_correct: false },
          { label: 'D', content: 'Using multiple flashes simultaneously', is_correct: false }
        ]
      },
      {
        stem: 'What is "color space" and why does it matter?',
        qtype: 'mcq',
        difficulty: 'hard',
        max_score: 3,
        options: [
          { label: 'A', content: 'Range of colors that can be represented; affects printing/display accuracy', is_correct: true },
          { label: 'B', content: 'White balance preset', is_correct: false },
          { label: 'C', content: 'Color temperature setting', is_correct: false },
          { label: 'D', content: 'Saturation level in camera', is_correct: false }
        ]
      },
      {
        stem: 'What is the "inverse square law" in lighting?',
        qtype: 'mcq',
        difficulty: 'hard',
        max_score: 3,
        options: [
          { label: 'A', content: 'Light intensity decreases by square of distance (double distance = 1/4 light)', is_correct: true },
          { label: 'B', content: 'Aperture area doubles with each stop', is_correct: false },
          { label: 'C', content: 'Shutter speed halves exposure with each stop', is_correct: false },
          { label: 'D', content: 'ISO sensitivity doubles with each setting', is_correct: false }
        ]
      },
      {
        stem: 'What is "focus stacking" and when is it used?',
        qtype: 'mcq',
        difficulty: 'hard',
        max_score: 3,
        options: [
          { label: 'A', content: 'Combining multiple images at different focus points for extended DOF', is_correct: true },
          { label: 'B', content: 'Using multiple autofocus points simultaneously', is_correct: false },
          { label: 'C', content: 'Stacking images for HDR', is_correct: false },
          { label: 'D', content: 'Creating composite panoramas', is_correct: false }
        ]
      },
      {
        stem: 'What is "chromatic aberration" and how is it corrected?',
        qtype: 'mcq',
        difficulty: 'hard',
        max_score: 3,
        options: [
          { label: 'A', content: 'Color fringing from lens imperfections; corrected with specialized glass elements or software', is_correct: true },
          { label: 'B', content: 'Wrong white balance; corrected in post-processing', is_correct: false },
          { label: 'C', content: 'Color noise from high ISO; corrected with noise reduction', is_correct: false },
          { label: 'D', content: 'Oversaturation; corrected by reducing vibrance', is_correct: false }
        ]
      },
      {
        stem: 'In zone system (Ansel Adams), Zone V represents:',
        qtype: 'mcq',
        difficulty: 'hard',
        max_score: 3,
        options: [
          { label: 'A', content: 'Middle gray (18% reflectance)', is_correct: true },
          { label: 'B', content: 'Pure white', is_correct: false },
          { label: 'C', content: 'Pure black', is_correct: false },
          { label: 'D', content: 'Highlight detail', is_correct: false }
        ]
      },
      {
        stem: 'What is "equivalence" in photography (e.g., full-frame vs crop sensor)?',
        qtype: 'mcq',
        difficulty: 'hard',
        max_score: 3,
        options: [
          { label: 'A', content: 'Matching field of view, DOF, and exposure across different sensor sizes', is_correct: true },
          { label: 'B', content: 'Using same focal length lens on different cameras', is_correct: false },
          { label: 'C', content: 'Matching megapixel count', is_correct: false },
          { label: 'D', content: 'Using equivalent ISO settings', is_correct: false }
        ]
      },
      {
        stem: 'What is "light falloff" and what causes it?',
        qtype: 'mcq',
        difficulty: 'hard',
        max_score: 3,
        options: [
          { label: 'A', content: 'Reduction of light intensity from center to edges; caused by lens design and physics', is_correct: true },
          { label: 'B', content: 'Battery running low in flash', is_correct: false },
          { label: 'C', content: 'Sensor overheating', is_correct: false },
          { label: 'D', content: 'Dirty lens elements', is_correct: false }
        ]
      },
      {
        stem: 'What is "moiré pattern" and how do you prevent it?',
        qtype: 'mcq',
        difficulty: 'hard',
        max_score: 3,
        options: [
          { label: 'A', content: 'Interference pattern from fine repetitive details; prevent with AA filter or slight defocus', is_correct: true },
          { label: 'B', content: 'Noise from high ISO; prevent with lower ISO', is_correct: false },
          { label: 'C', content: 'Lens flare; prevent with lens hood', is_correct: false },
          { label: 'D', content: 'Motion blur; prevent with faster shutter', is_correct: false }
        ]
      },
      {
        stem: 'What is "MTF chart" used for in lens evaluation?',
        qtype: 'mcq',
        difficulty: 'hard',
        max_score: 3,
        options: [
          { label: 'A', content: 'Measuring lens contrast and resolution across frame', is_correct: true },
          { label: 'B', content: 'Testing color accuracy', is_correct: false },
          { label: 'C', content: 'Measuring autofocus speed', is_correct: false },
          { label: 'D', content: 'Checking for dust inside lens', is_correct: false }
        ]
      },
      {
        stem: 'What is "split toning" and what creative effect does it produce?',
        qtype: 'mcq',
        difficulty: 'hard',
        max_score: 3,
        options: [
          { label: 'A', content: 'Adding different colors to highlights and shadows for artistic mood', is_correct: true },
          { label: 'B', content: 'Converting to black and white', is_correct: false },
          { label: 'C', content: 'Adjusting exposure separately for left/right halves', is_correct: false },
          { label: 'D', content: 'Creating double exposure effect', is_correct: false }
        ]
      }
    ];

    let questionCount = 0;
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    for (const q of questions) {
      // Insert question
      const questionResult = await pool.request()
        .input('moocId', sql.BigInt, mooc.mooc_id)
        .input('stem', sql.NVarChar, q.stem)
        .input('qtype', sql.NVarChar, q.qtype)
        .input('difficulty', sql.NVarChar, q.difficulty)
        .input('maxScore', sql.Decimal(5,2), q.max_score)
        .query(`
          INSERT INTO questions (mooc_id, stem, qtype, difficulty, max_score, created_at)
          OUTPUT INSERTED.question_id
          VALUES (@moocId, @stem, @qtype, @difficulty, @maxScore, GETDATE())
        `);

      const questionId = questionResult.recordset[0].question_id;

      // Insert options
      for (const opt of q.options) {
        await pool.request()
          .input('questionId', sql.BigInt, questionId)
          .input('label', sql.NVarChar, opt.label)
          .input('content', sql.NVarChar, opt.content)
          .input('isCorrect', sql.Bit, opt.is_correct ? 1 : 0)
          .query(`
            INSERT INTO question_options (question_id, label, content, is_correct)
            VALUES (@questionId, @label, @content, @isCorrect)
          `);
      }

      // Link question to exam
      await pool.request()
        .input('examId', sql.BigInt, examId)
        .input('questionId', sql.BigInt, questionId)
        .input('orderNo', sql.Int, questionCount + 1)
        .input('points', sql.Decimal(5,2), q.max_score)
        .query(`
          INSERT INTO exam_items (exam_id, question_id, order_no, points)
          VALUES (@examId, @questionId, @orderNo, @points)
        `);

      questionCount++;
      if (q.difficulty === 'easy') easyCount++;
      else if (q.difficulty === 'medium') mediumCount++;
      else if (q.difficulty === 'hard') hardCount++;

      process.stdout.write(`\r  Inserted: ${questionCount}/60 questions (${easyCount} easy, ${mediumCount} medium, ${hardCount} hard)`);
    }

    console.log('\n\n✅ Question bank created successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`  Total questions: ${questionCount}`);
    console.log(`  Easy: ${easyCount} (1 point each)`);
    console.log(`  Medium: ${mediumCount} (2 points each)`);
    console.log(`  Hard: ${hardCount} (3 points each)`);
    console.log(`  Max possible score: ${easyCount * 1 + mediumCount * 2 + hardCount * 3} points`);
    console.log(`\n🎓 Exam: "${await getExamName(pool, examId)}"`);
    console.log(`  Duration: 60 minutes`);
    console.log(`  Attempts allowed: 2`);
    console.log(`  Questions per attempt: 30 (random from 60-question bank)`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

async function getExamName(pool, examId) {
  const result = await pool.request()
    .input('examId', sql.BigInt, examId)
    .query('SELECT name FROM exams WHERE exam_id = @examId');
  return result.recordset[0]?.name || 'Unknown';
}

insertExamQuestions();
