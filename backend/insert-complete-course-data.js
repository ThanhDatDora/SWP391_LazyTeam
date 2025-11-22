import sql from 'mssql';
import { getPool } from './config/database.js';

/**
 * Insert complete course data with all content types:
 * - video: Video lessons
 * - reading: Text/article content
 * - quiz: Short assessments
 * - exam: Final exams (in exams table)
 * - discussion: Forum topics
 */

async function insertCompleteCourseData() {
  try {
    const pool = await getPool();
    
    console.log('🚀 Starting complete course data insertion...\n');

    // 1. Find existing course (Photography Masterclass)
    const courseResult = await pool.request().query(`
      SELECT TOP 1 course_id, title 
      FROM courses 
      WHERE title LIKE '%Photography%'
    `);

    if (courseResult.recordset.length === 0) {
      console.log('❌ No course found. Please create a course first.');
      return;
    }

    const course = courseResult.recordset[0];
    console.log(`✅ Found course: ${course.title} (ID: ${course.course_id})\n`);

    // 2. Clear existing lessons/MOOCs for fresh start
    console.log('🗑️  Cleaning existing MOOCs and lessons...');
    await pool.request()
      .input('courseId', sql.BigInt, course.course_id)
      .query(`
        DELETE FROM progress WHERE lesson_id IN (
          SELECT l.lesson_id FROM lessons l
          JOIN moocs m ON l.mooc_id = m.mooc_id
          WHERE m.course_id = @courseId
        );
        DELETE FROM lessons WHERE mooc_id IN (
          SELECT mooc_id FROM moocs WHERE course_id = @courseId
        );
        DELETE FROM exams WHERE mooc_id IN (
          SELECT mooc_id FROM moocs WHERE course_id = @courseId
        );
        DELETE FROM moocs WHERE course_id = @courseId;
      `);
    console.log('✅ Cleaned old data\n');

    // 3. Define complete course structure
    const courseStructure = [
      {
        title: 'Introduction to Photography',
        order_no: 1,
        lessons: [
          {
            title: 'Welcome to Photography Masterclass',
            content_type: 'video',
            content_url: 'https://www.youtube.com/embed/V7z7BAZdt2M',
            order_no: 1,
            is_preview: true
          },
          {
            title: 'Course Overview and What You Will Learn',
            content_type: 'reading',
            content_url: JSON.stringify({
              type: 'article',
              content: `
                <h2>📸 Welcome to the Photography Masterclass!</h2>
                <p class="lead">This comprehensive course is designed to transform you from a beginner to a confident photographer who can capture stunning images in any situation. Whether you're using a professional DSLR, a mirrorless camera, or even your smartphone, this course will teach you the fundamental principles and advanced techniques used by professional photographers.</p>
                
                <h3>🎯 Course Objectives</h3>
                <p>By the end of this course, you will be able to:</p>
                <ul>
                  <li><strong>Master Camera Controls:</strong> Understand and confidently use manual mode, including ISO, aperture, shutter speed, and white balance</li>
                  <li><strong>Compose Like a Pro:</strong> Apply professional composition techniques including rule of thirds, leading lines, framing, and symmetry</li>
                  <li><strong>Control Light:</strong> Work with natural light, artificial light, and understand how to shape light for different effects</li>
                  <li><strong>Edit Your Photos:</strong> Basic post-processing techniques to enhance your images without over-editing</li>
                  <li><strong>Develop Your Style:</strong> Build a cohesive portfolio that reflects your unique artistic vision</li>
                </ul>
                
                <h3>📚 What You'll Learn:</h3>
                
                <h4>Module 1: Camera Fundamentals (Week 1-2)</h4>
                <ul>
                  <li>📷 <strong>Understanding Your Camera:</strong> DSLR vs Mirrorless, sensor sizes, megapixels myth</li>
                  <li>⚙️ <strong>The Exposure Triangle:</strong> ISO, Aperture (f-stops), Shutter Speed - how they work together</li>
                  <li>🎨 <strong>Shooting Modes:</strong> When to use Auto, Program, Aperture Priority, Shutter Priority, and Manual</li>
                  <li>🔍 <strong>Focus Techniques:</strong> Single-point AF, continuous AF, face detection, manual focus</li>
                  <li>⚖️ <strong>Metering Modes:</strong> Evaluative, center-weighted, spot metering</li>
                  <li>� <strong>White Balance:</strong> Color temperature, custom white balance, shooting in RAW</li>
                </ul>
                
                <h4>Module 2: Composition Mastery (Week 3-4)</h4>
                <ul>
                  <li>📐 <strong>Rule of Thirds:</strong> The golden ratio in photography</li>
                  <li>➡️ <strong>Leading Lines:</strong> Using natural and architectural lines to guide the viewer's eye</li>
                  <li>🖼️ <strong>Framing:</strong> Natural frames, doorways, windows, and creative framing</li>
                  <li>� <strong>Symmetry and Patterns:</strong> Finding order in chaos</li>
                  <li>⭕ <strong>Negative Space:</strong> The power of emptiness in composition</li>
                  <li>👁️ <strong>Point of View:</strong> Eye-level, high angle, low angle, bird's eye view</li>
                  <li>🎭 <strong>Depth and Layers:</strong> Creating three-dimensional feel in 2D images</li>
                </ul>
                
                <h4>Module 3: Lighting Techniques (Week 5-6)</h4>
                <ul>
                  <li>☀️ <strong>Natural Light:</strong> Golden hour, blue hour, harsh midday sun, overcast conditions</li>
                  <li>🌅 <strong>Direction of Light:</strong> Front light, side light, back light, rim light</li>
                  <li>💡 <strong>Artificial Light:</strong> Continuous vs flash, speedlights, studio strobes</li>
                  <li>� <strong>Light Modifiers:</strong> Softboxes, umbrellas, reflectors, diffusers</li>
                  <li>⚡ <strong>Flash Photography:</strong> On-camera flash, off-camera flash, high-speed sync</li>
                  <li>🌙 <strong>Low Light Photography:</strong> Night photography, star trails, light painting</li>
                </ul>
                
                <h4>Module 4: Post-Processing Essentials (Week 7)</h4>
                <ul>
                  <li>🖥️ <strong>RAW vs JPEG:</strong> Why shoot RAW, workflow benefits</li>
                  <li>🎨 <strong>Basic Adjustments:</strong> Exposure, contrast, highlights, shadows</li>
                  <li>🌈 <strong>Color Correction:</strong> White balance, vibrance, saturation</li>
                  <li>✨ <strong>Sharpening and Noise Reduction:</strong> When and how much</li>
                  <li>📏 <strong>Cropping and Straightening:</strong> Maintaining aspect ratios</li>
                  <li>🎭 <strong>Advanced Techniques:</strong> Dodging, burning, local adjustments</li>
                </ul>
                
                <h4>Module 5: Genre-Specific Photography (Week 8)</h4>
                <ul>
                  <li>👤 <strong>Portrait Photography:</strong> Posing, expressions, connecting with subjects</li>
                  <li>🏞️ <strong>Landscape Photography:</strong> Foreground interest, depth of field, filters</li>
                  <li>📸 <strong>Street Photography:</strong> Ethics, candid moments, storytelling</li>
                  <li>🏢 <strong>Architecture:</strong> Perspective control, avoiding distortion</li>
                  <li>🌸 <strong>Macro Photography:</strong> Close-up techniques, focus stacking</li>
                  <li>⚡ <strong>Action and Sports:</strong> Freezing motion, panning techniques</li>
                </ul>
                
                <h3>🛠️ Course Requirements:</h3>
                <div class="requirements-box">
                  <h4>Essential:</h4>
                  <ul>
                    <li>Any camera with manual controls (DSLR, mirrorless, or advanced smartphone)</li>
                    <li>Enthusiasm and willingness to practice</li>
                    <li>Computer for viewing lessons and editing (basic specs)</li>
                  </ul>
                  
                  <h4>Recommended (but not required):</h4>
                  <ul>
                    <li>A versatile zoom lens (18-55mm or 24-70mm)</li>
                    <li>Tripod for stability</li>
                    <li>Photo editing software (free options like GIMP or paid like Lightroom)</li>
                    <li>Memory cards and card reader</li>
                  </ul>
                </div>
                
                <h3>📅 Time Commitment:</h3>
                <p>This course is designed to be flexible:</p>
                <ul>
                  <li><strong>Video Lessons:</strong> 8-10 hours total</li>
                  <li><strong>Reading Materials:</strong> 3-4 hours</li>
                  <li><strong>Practice Assignments:</strong> 10-15 hours (highly recommended)</li>
                  <li><strong>Pace:</strong> Complete at your own speed, typical students finish in 6-8 weeks</li>
                </ul>
                
                <h3>🎓 Certification:</h3>
                <p>Upon successful completion of all modules, quizzes, and the final project, you will receive a Certificate of Completion that you can:</p>
                <ul>
                  <li>Add to your professional portfolio</li>
                  <li>Share on LinkedIn and social media</li>
                  <li>Include in your CV/resume</li>
                </ul>
                
                <h3>👨‍🏫 Your Instructor:</h3>
                <p>This course is taught by professional photographers with over 15 years of combined experience in commercial photography, wedding photography, and photojournalism. Our instructors have worked with major brands, published in international magazines, and most importantly, have taught thousands of students successfully.</p>
                
                <blockquote>
                  <p>"Photography is the story I fail to put into words." - Destin Sparks</p>
                </blockquote>
                
                <div class="cta-box">
                  <h3>🚀 Ready to Begin Your Photography Journey?</h3>
                  <p>Let's start with understanding your camera and the fundamental settings that will give you complete creative control. Click "Next" to proceed to your first video lesson!</p>
                </div>
                
                <style>
                  .lead { font-size: 1.1em; line-height: 1.6; color: #374151; margin-bottom: 2em; }
                  .requirements-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 1.5em; margin: 1.5em 0; border-radius: 8px; }
                  .requirements-box h4 { color: #047857; margin-top: 0; }
                  .cta-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2em; border-radius: 12px; text-align: center; margin-top: 2em; }
                  .cta-box h3 { color: white; margin-top: 0; }
                  blockquote { border-left: 4px solid #6366f1; padding-left: 1.5em; font-style: italic; color: #6b7280; margin: 2em 0; }
                </style>
              `
            }),
            order_no: 2,
            is_preview: true
          },
          {
            title: 'Photography Equipment Guide',
            content_type: 'reading',
            content_url: JSON.stringify({
              type: 'article',
              content: `
                <h2>📷 Essential Photography Equipment: A Comprehensive Guide</h2>
                <p class="lead">Choosing the right equipment can be overwhelming for beginners. This guide will help you understand what gear you actually need, what's nice to have, and what you can skip entirely. Remember: the best camera is the one you have with you!</p>
                
                <h3>🎥 1. Camera Bodies</h3>
                
                <h4>DSLR (Digital Single-Lens Reflex)</h4>
                <div class="equipment-card">
                  <h5>✅ Pros:</h5>
                  <ul>
                    <li><strong>Optical Viewfinder:</strong> Real-time view through the lens, no lag</li>
                    <li><strong>Longer Battery Life:</strong> 600-1000+ shots per charge</li>
                    <li><strong>Extensive Lens Selection:</strong> Decades of compatible lenses</li>
                    <li><strong>Ergonomics:</strong> Larger grip, comfortable for big hands</li>
                    <li><strong>Price:</strong> Often more affordable in used market</li>
                  </ul>
                  
                  <h5>❌ Cons:</h5>
                  <ul>
                    <li>Heavier and bulkier</li>
                    <li>Mirror mechanism adds complexity and noise</li>
                    <li>Limited video features on older models</li>
                    <li>No electronic preview of exposure</li>
                  </ul>
                  
                  <h5>🎯 Best For:</h5>
                  <p>Sports photographers, wildlife photographers, photographers who prefer traditional shooting experience</p>
                  
                  <h5>💡 Recommended Models:</h5>
                  <ul>
                    <li><strong>Entry-level:</strong> Canon EOS Rebel T7i/T8i, Nikon D3500/D5600 ($400-600)</li>
                    <li><strong>Mid-range:</strong> Canon EOS 90D, Nikon D7500 ($900-1200)</li>
                    <li><strong>Professional:</strong> Canon EOS 5D Mark IV, Nikon D850 ($2000-3500)</li>
                  </ul>
                </div>
                
                <h4>Mirrorless Cameras</h4>
                <div class="equipment-card">
                  <h5>✅ Pros:</h5>
                  <ul>
                    <li><strong>Compact and Lightweight:</strong> 20-30% smaller than equivalent DSLRs</li>
                    <li><strong>Electronic Viewfinder (EVF):</strong> Preview exposure, white balance in real-time</li>
                    <li><strong>Faster Autofocus:</strong> Face/eye detection, animal AF</li>
                    <li><strong>Silent Shooting:</strong> Perfect for weddings, wildlife</li>
                    <li><strong>Advanced Video:</strong> 4K, 8K in newer models</li>
                    <li><strong>In-Body Stabilization (IBIS):</strong> Available in many models</li>
                  </ul>
                  
                  <h5>❌ Cons:</h5>
                  <ul>
                    <li>Shorter battery life (300-400 shots)</li>
                    <li>Electronic viewfinder lag in low light (improving)</li>
                    <li>Smaller lens selection (rapidly expanding)</li>
                    <li>Generally more expensive</li>
                  </ul>
                  
                  <h5>🎯 Best For:</h5>
                  <p>Travel photographers, videographers, street photographers, anyone wanting latest technology</p>
                  
                  <h5>💡 Recommended Models:</h5>
                  <ul>
                    <li><strong>Entry-level:</strong> Sony A6100, Canon EOS M50 Mark II ($600-750)</li>
                    <li><strong>Mid-range:</strong> Sony A6600, Fujifilm X-T4, Canon EOS R6 ($1000-2500)</li>
                    <li><strong>Professional:</strong> Sony A7R V, Canon EOS R5, Nikon Z9 ($3500-6000)</li>
                  </ul>
                </div>
                
                <h4>Smartphone Photography</h4>
                <div class="equipment-card">
                  <p><strong>Don't underestimate modern smartphones!</strong> iPhone 15 Pro, Samsung Galaxy S24 Ultra, Google Pixel 8 Pro offer:</p>
                  <ul>
                    <li>Computational photography (HDR, night mode, portrait mode)</li>
                    <li>Multiple lenses (ultra-wide, telephoto)</li>
                    <li>Instant sharing and editing</li>
                    <li>Always with you</li>
                  </ul>
                  <p><em>Great for: Social media, travel documentation, street photography, learning composition</em></p>
                </div>
                
                <h3>🔍 2. Lenses: Your Most Important Investment</h3>
                <p><strong>Important:</strong> Lenses matter more than camera bodies! A $500 camera with a $1000 lens will produce better images than a $2000 camera with a $200 lens.</p>
                
                <h4>Kit Lens (18-55mm or 24-70mm)</h4>
                <ul>
                  <li><strong>What it is:</strong> The lens that comes with your camera</li>
                  <li><strong>Focal length:</strong> Versatile zoom range</li>
                  <li><strong>Aperture:</strong> Usually f/3.5-5.6 (variable)</li>
                  <li><strong>Best for:</strong> Learning, general photography</li>
                  <li><strong>Price:</strong> $100-300 if bought separately</li>
                  <li><strong>Recommendation:</strong> Start here! Learn all its capabilities before upgrading</li>
                </ul>
                
                <h4>Prime Lenses ("Nifty Fifty" - 50mm f/1.8)</h4>
                <ul>
                  <li><strong>What it is:</strong> Fixed focal length, no zoom</li>
                  <li><strong>Aperture:</strong> f/1.8 or f/1.4 (wide aperture)</li>
                  <li><strong>Benefits:</strong> Beautiful bokeh (blurry background), excellent in low light, forces you to move and compose</li>
                  <li><strong>Best for:</strong> Portraits, street photography, learning composition</li>
                  <li><strong>Price:</strong> $125-400</li>
                  <li><strong>Recommendation:</strong> Every photographer should own a 50mm f/1.8. It's affordable and teaches fundamentals</li>
                </ul>
                
                <h4>Wide-Angle Lens (10-24mm or 16-35mm)</h4>
                <ul>
                  <li><strong>What it is:</strong> Captures more of the scene</li>
                  <li><strong>Best for:</strong> Landscapes, architecture, interiors, real estate</li>
                  <li><strong>Caution:</strong> Can distort faces if used for portraits</li>
                  <li><strong>Price:</strong> $300-2000</li>
                  <li><strong>Recommendation:</strong> Essential for landscape photographers</li>
                </ul>
                
                <h4>Telephoto Lens (70-200mm or 100-400mm)</h4>
                <ul>
                  <li><strong>What it is:</strong> Brings distant subjects closer</li>
                  <li><strong>Best for:</strong> Wildlife, sports, bird photography, candid portraits</li>
                  <li><strong>Benefits:</strong> Compression effect, subject isolation</li>
                  <li><strong>Price:</strong> $600-3000+</li>
                  <li><strong>Recommendation:</strong> Wait until you know you need the reach</li>
                </ul>
                
                <h4>Macro Lens (90-105mm macro)</h4>
                <ul>
                  <li><strong>What it is:</strong> Extreme close-up photography</li>
                  <li><strong>Best for:</strong> Flowers, insects, jewelry, product photography</li>
                  <li><strong>Magnification:</strong> 1:1 or higher (life-size reproduction)</li>
                  <li><strong>Price:</strong> $400-1200</li>
                  <li><strong>Recommendation:</strong> Specialized use, buy when you develop interest in macro</li>
                </ul>
                
                <h3>🎒 3. Essential Accessories</h3>
                
                <h4>Tripod</h4>
                <div class="accessory-card">
                  <p><strong>Why you need it:</strong></p>
                  <ul>
                    <li>Long exposures (waterfalls, night sky, light trails)</li>
                    <li>Sharp landscape photos</li>
                    <li>Self-portraits and group photos</li>
                    <li>Video recording</li>
                  </ul>
                  <p><strong>What to look for:</strong></p>
                  <ul>
                    <li>Stable (can hold your heaviest camera + lens combo)</li>
                    <li>Lightweight if traveling (carbon fiber)</li>
                    <li>Quick-release plate</li>
                    <li>Ball head or 3-way head</li>
                  </ul>
                  <p><strong>Price range:</strong></p>
                  <ul>
                    <li>Budget: $30-80 (Aluminum, entry-level)</li>
                    <li>Mid-range: $100-250 (Better build, smoother operation)</li>
                    <li>Professional: $300-600+ (Carbon fiber, precise controls)</li>
                  </ul>
                  <p><strong>Recommended brands:</strong> Manfrotto, Vanguard, Benro, Really Right Stuff</p>
                </div>
                
                <h4>Memory Cards</h4>
                <ul>
                  <li><strong>Type:</strong> SD cards (most common), CFexpress (high-end cameras)</li>
                  <li><strong>Speed:</strong> UHS-I (U1/U3) minimum, UHS-II for 4K video</li>
                  <li><strong>Capacity:</strong> 32GB-128GB per card</li>
                  <li><strong>Important:</strong> Buy from reputable sources (fake cards are common)</li>
                  <li><strong>Recommendation:</strong> Have at least 2-3 cards. Never put all your eggs in one basket!</li>
                  <li><strong>Price:</strong> $15-100 depending on speed and capacity</li>
                </ul>
                
                <h4>Camera Bag</h4>
                <ul>
                  <li><strong>Backpack:</strong> Comfortable for hiking, more gear capacity</li>
                  <li><strong>Sling/Messenger:</strong> Quick access, urban/street photography</li>
                  <li><strong>Rolling case:</strong> Studio work, lots of gear</li>
                  <li><strong>Features to look for:</strong> Padding, weather resistance, customizable dividers, laptop compartment</li>
                  <li><strong>Price:</strong> $30-300</li>
                </ul>
                
                <h4>Spare Batteries</h4>
                <ul>
                  <li><strong>Why:</strong> Don't miss shots due to dead battery</li>
                  <li><strong>How many:</strong> At least 1 spare (2-3 for mirrorless)</li>
                  <li><strong>OEM vs third-party:</strong> OEM more reliable but expensive</li>
                  <li><strong>Price:</strong> $15-80 each</li>
                </ul>
                
                <h4>Cleaning Kit</h4>
                <ul>
                  <li>Rocket blower (remove dust)</li>
                  <li>Microfiber cloths (clean lens)</li>
                  <li>Lens pen (remove fingerprints)</li>
                  <li>Sensor cleaning swabs (advanced users)</li>
                  <li><strong>Price:</strong> $20-50 for complete kit</li>
                </ul>
                
                <h3>💡 4. Nice-to-Have Accessories</h3>
                
                <h4>External Flash/Speedlight</h4>
                <ul>
                  <li><strong>Benefits:</strong> Better portraits, fill light, creative lighting</li>
                  <li><strong>Techniques:</strong> Bounce flash, off-camera flash</li>
                  <li><strong>Price:</strong> $100-500</li>
                  <li><strong>When to buy:</strong> After mastering natural light</li>
                </ul>
                
                <h4>Filters</h4>
                <ul>
                  <li><strong>UV/Protective:</strong> Lens protection ($15-50)</li>
                  <li><strong>Polarizing (CPL):</strong> Reduce reflections, enhance colors ($30-150)</li>
                  <li><strong>Neutral Density (ND):</strong> Long exposures in bright light ($40-200)</li>
                  <li><strong>Graduated ND:</strong> Balance sky and foreground exposure ($50-200)</li>
                </ul>
                
                <h4>Remote Shutter Release</h4>
                <ul>
                  <li>Prevent camera shake</li>
                  <li>Long exposures</li>
                  <li>Timelapse photography</li>
                  <li><strong>Price:</strong> $10-50</li>
                </ul>
                
                <h4>Reflector/Diffuser</h4>
                <ul>
                  <li>Bounce light into shadows</li>
                  <li>Soften harsh sunlight</li>
                  <li>5-in-1 reflector kit: $20-40</li>
                </ul>
                
                <h3>🚫 What NOT to Buy (Yet)</h3>
                <ul>
                  <li>❌ <strong>Cheap tripod:</strong> Buy once, cry once. Save for a decent one</li>
                  <li>❌ <strong>Too many lenses early:</strong> Master what you have first</li>
                  <li>❌ <strong>Gimmicky accessories:</strong> Lens clip-ons, star filters, etc.</li>
                  <li>❌ <strong>Top-end camera body:</strong> Your skills matter more than megapixels</li>
                  <li>❌ <strong>Expensive camera bag:</strong> Start with something affordable</li>
                </ul>
                
                <h3>💰 Budget Recommendations</h3>
                
                <div class="budget-table">
                  <h4>Starter Budget ($500-800)</h4>
                  <ul>
                    <li>Used/refurbished camera + kit lens: $350-500</li>
                    <li>50mm f/1.8 lens: $125</li>
                    <li>Basic tripod: $40</li>
                    <li>Memory cards (2x 32GB): $30</li>
                    <li>Camera bag: $30</li>
                    <li>Cleaning kit: $15</li>
                  </ul>
                  
                  <h4>Enthusiast Budget ($1500-2500)</h4>
                  <ul>
                    <li>New mid-range camera + kit lens: $900-1200</li>
                    <li>50mm f/1.8 or f/1.4: $150-400</li>
                    <li>Good tripod: $150</li>
                    <li>Memory cards (3x 64GB): $60</li>
                    <li>Quality camera bag: $80</li>
                    <li>Spare batteries (2): $50</li>
                    <li>CPL filter: $50</li>
                    <li>External flash: $200</li>
                  </ul>
                  
                  <h4>Professional Budget ($4000-8000+)</h4>
                  <ul>
                    <li>Professional camera body: $2500-4000</li>
                    <li>24-70mm f/2.8: $1000-2000</li>
                    <li>70-200mm f/2.8: $1300-2500</li>
                    <li>Carbon fiber tripod: $400</li>
                    <li>Memory cards (multiple, high-speed): $200</li>
                    <li>Professional bag: $200</li>
                    <li>Multiple batteries: $150</li>
                    <li>Filter system: $300</li>
                    <li>Lighting equipment: $500+</li>
                  </ul>
                </div>
                
                <h3>🎓 Final Advice</h3>
                <blockquote>
                  <p>"The single most important component of a camera is the twelve inches behind it!" - Ansel Adams</p>
                </blockquote>
                
                <div class="tip-box">
                  <h4>💡 Smart Shopping Tips:</h4>
                  <ul>
                    <li>✅ Buy used/refurbished from reputable dealers (MPB, KEH, Adorama)</li>
                    <li>✅ Rent equipment before buying (BorrowLenses, LensRentals)</li>
                    <li>✅ Wait for Black Friday, Cyber Monday deals</li>
                    <li>✅ Prioritize lenses over camera bodies</li>
                    <li>✅ Build your kit gradually based on actual needs</li>
                    <li>✅ Read reviews, watch YouTube comparisons</li>
                    <li>✅ Consider lens ecosystem when choosing brand</li>
                    <li>❌ Don't buy gear to "fix" bad photos - learn technique first</li>
                    <li>❌ Don't get caught in "gear acquisition syndrome" (G.A.S.)</li>
                  </ul>
                </div>
                
                <p class="conclusion">Remember: The best camera is the one you have with you. Start with what you can afford, learn its capabilities inside and out, and upgrade only when you've truly outgrown your current gear. Invest in education and experiences, not just equipment!</p>
                
                <style>
                  .lead { font-size: 1.1em; line-height: 1.6; color: #374151; margin-bottom: 2em; }
                  .equipment-card, .accessory-card { 
                    background: #f9fafb; 
                    border: 2px solid #e5e7eb; 
                    border-radius: 12px; 
                    padding: 1.5em; 
                    margin: 1.5em 0; 
                  }
                  .equipment-card h5 { color: #1f2937; margin-top: 1em; }
                  .budget-table { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1.5em; margin: 1.5em 0; border-radius: 8px; }
                  .budget-table h4 { color: #92400e; }
                  .tip-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 1.5em; margin: 1.5em 0; border-radius: 8px; }
                  .tip-box h4 { color: #1e40af; margin-top: 0; }
                  .conclusion { font-size: 1.1em; font-weight: 500; color: #059669; background: #d1fae5; padding: 1.5em; border-radius: 8px; margin-top: 2em; }
                  blockquote { border-left: 4px solid #8b5cf6; padding-left: 1.5em; font-style: italic; color: #6b7280; margin: 2em 0; font-size: 1.1em; }
                </style>
              `
            }),
            order_no: 3,
            is_preview: false
          }
        ],
        hasExam: false
      },
      {
        title: 'Camera Fundamentals',
        order_no: 2,
        lessons: [
          {
            title: 'Understanding Exposure Triangle',
            content_type: 'video',
            content_url: 'https://www.youtube.com/embed/3QbjJaszlmU',
            order_no: 1,
            is_preview: false
          },
          {
            title: 'ISO, Aperture, and Shutter Speed Explained',
            content_type: 'reading',
            content_url: JSON.stringify({
              type: 'article',
              content: `
                <h2>The Exposure Triangle</h2>
                <p>The three pillars of exposure work together to create perfectly exposed images.</p>
                
                <h3>ISO (Sensitivity)</h3>
                <p>Controls the camera sensor's sensitivity to light.</p>
                <ul>
                  <li>Low ISO (100-400): Bright conditions, less noise</li>
                  <li>High ISO (800+): Low light, more noise/grain</li>
                </ul>
                
                <h3>Aperture (f-stop)</h3>
                <p>Controls the lens opening and depth of field.</p>
                <ul>
                  <li>Wide aperture (f/1.8-f/4): Shallow depth, blurry background</li>
                  <li>Narrow aperture (f/8-f/22): Deep depth, sharp throughout</li>
                </ul>
                
                <h3>Shutter Speed</h3>
                <p>Controls how long the sensor is exposed to light.</p>
                <ul>
                  <li>Fast (1/500s+): Freeze motion</li>
                  <li>Slow (1/30s-): Motion blur, light trails</li>
                </ul>
              `
            }),
            order_no: 2,
            is_preview: false
          },
          {
            title: 'Camera Settings Practice',
            content_type: 'video',
            content_url: 'https://www.youtube.com/embed/LxO-6rlihSg',
            order_no: 3,
            is_preview: false
          },
          {
            title: 'Quiz: Camera Fundamentals',
            content_type: 'quiz',
            content_url: JSON.stringify({
              type: 'quiz',
              questions: [
                {
                  id: 1,
                  question: 'What does ISO control in photography?',
                  options: [
                    'Lens opening size',
                    'Sensor sensitivity to light',
                    'Shutter speed duration',
                    'White balance'
                  ],
                  correctAnswer: 1,
                  explanation: 'ISO controls the camera sensor\'s sensitivity to light. Higher ISO means more sensitivity but also more noise.'
                },
                {
                  id: 2,
                  question: 'Which aperture creates a blurry background (bokeh)?',
                  options: [
                    'f/16',
                    'f/22',
                    'f/1.8',
                    'f/11'
                  ],
                  correctAnswer: 2,
                  explanation: 'Wide apertures like f/1.8 create shallow depth of field, resulting in blurry backgrounds.'
                },
                {
                  id: 3,
                  question: 'What shutter speed would you use to freeze fast action?',
                  options: [
                    '1/30 second',
                    '1 second',
                    '1/1000 second',
                    '30 seconds'
                  ],
                  correctAnswer: 2,
                  explanation: 'Fast shutter speeds like 1/1000s freeze motion effectively.'
                }
              ],
              passingScore: 70,
              timeLimit: 5
            }),
            order_no: 4,
            is_preview: false
          }
        ],
        hasExam: false
      },
      {
        title: 'Composition Techniques',
        order_no: 3,
        lessons: [
          {
            title: 'Rule of Thirds',
            content_type: 'video',
            content_url: 'https://www.youtube.com/embed/1p9bGRdvQRo',
            order_no: 1,
            is_preview: false
          },
          {
            title: 'Leading Lines and Framing',
            content_type: 'reading',
            content_url: JSON.stringify({
              type: 'article',
              content: `
                <h2>Advanced Composition Techniques</h2>
                
                <h3>Leading Lines</h3>
                <p>Use natural or man-made lines to guide viewer's eye through the image.</p>
                <ul>
                  <li>Roads and paths</li>
                  <li>Fences and railings</li>
                  <li>Rivers and coastlines</li>
                  <li>Architectural elements</li>
                </ul>
                
                <h3>Natural Framing</h3>
                <p>Use elements in the scene to frame your subject:</p>
                <ul>
                  <li>Windows and doorways</li>
                  <li>Tree branches</li>
                  <li>Arches and tunnels</li>
                </ul>
                
                <h3>Negative Space</h3>
                <p>Empty space around your subject can create powerful, minimalist compositions.</p>
              `
            }),
            order_no: 2,
            is_preview: false
          },
          {
            title: 'Symmetry and Patterns',
            content_type: 'video',
            content_url: 'https://www.youtube.com/embed/rEFrwrhBF2I',
            order_no: 3,
            is_preview: false
          }
        ],
        hasExam: true,
        exam: {
          name: 'Composition Techniques Assessment',
          duration_minutes: 20,
          attempts_allowed: 3,
          show_answers_after: null // Will show after completion
        }
      },
      {
        title: 'Lighting Mastery',
        order_no: 4,
        lessons: [
          {
            title: 'Natural Light Photography',
            content_type: 'video',
            content_url: 'https://www.youtube.com/embed/IJ2Ro8QbnSE',
            order_no: 1,
            is_preview: false
          },
          {
            title: 'Golden Hour and Blue Hour',
            content_type: 'reading',
            content_url: JSON.stringify({
              type: 'article',
              content: `
                <h2>The Magic Hours of Photography</h2>
                
                <h3>Golden Hour</h3>
                <p>The hour after sunrise and before sunset when light is soft and warm.</p>
                <ul>
                  <li>Warm, golden tones</li>
                  <li>Soft, directional light</li>
                  <li>Long shadows</li>
                  <li>Perfect for portraits and landscapes</li>
                </ul>
                
                <h3>Blue Hour</h3>
                <p>The period of twilight when the sun is below the horizon.</p>
                <ul>
                  <li>Cool blue tones</li>
                  <li>Even, diffused light</li>
                  <li>Great for cityscapes</li>
                  <li>Blend artificial and natural light</li>
                </ul>
              `
            }),
            order_no: 2,
            is_preview: false
          },
          {
            title: 'Flash Photography Basics',
            content_type: 'video',
            content_url: 'https://www.youtube.com/embed/5BYO0HgNjiA',
            order_no: 3,
            is_preview: false
          }
        ],
        hasExam: false
      },
      {
        title: 'Final Project',
        order_no: 5,
        lessons: [
          {
            title: 'Project Guidelines',
            content_type: 'reading',
            content_url: JSON.stringify({
              type: 'article',
              content: `
                <h2>Final Project: Create Your Portfolio</h2>
                
                <h3>Objective</h3>
                <p>Apply everything you've learned to create a cohesive portfolio of 10-15 images.</p>
                
                <h3>Requirements</h3>
                <ul>
                  <li>Demonstrate variety in composition</li>
                  <li>Show understanding of exposure</li>
                  <li>Include different lighting conditions</li>
                  <li>Present a consistent style</li>
                </ul>
                
                <h3>Submission</h3>
                <p>Submit your portfolio in the discussion forum for peer review.</p>
              `
            }),
            order_no: 1,
            is_preview: false
          },
          {
            title: 'Portfolio Discussion Forum',
            content_type: 'discussion',
            content_url: JSON.stringify({
              type: 'forum',
              topic: 'Share Your Final Portfolio',
              description: 'Upload your final project and provide feedback to your peers.'
            }),
            order_no: 2,
            is_preview: false
          }
        ],
        hasExam: true,
        exam: {
          name: 'Photography Masterclass Final Exam',
          duration_minutes: 30,
          attempts_allowed: 2,
          show_answers_after: null // Never show answers for final exam
        }
      }
    ];

    // 4. Insert MOOCs and Lessons
    let totalLessons = 0;
    let totalExams = 0;

    for (const mooc of courseStructure) {
      console.log(`📚 Creating MOOC: ${mooc.title}`);
      
      // Insert MOOC
      const moocResult = await pool.request()
        .input('courseId', sql.BigInt, course.course_id)
        .input('title', sql.NVarChar, mooc.title)
        .input('orderNo', sql.Int, mooc.order_no)
        .query(`
          INSERT INTO moocs (course_id, title, order_no)
          OUTPUT INSERTED.mooc_id
          VALUES (@courseId, @title, @orderNo)
        `);

      const moocId = moocResult.recordset[0].mooc_id;
      console.log(`  ✅ MOOC ID: ${moocId}`);

      // Insert lessons
      for (const lesson of mooc.lessons) {
        await pool.request()
          .input('moocId', sql.BigInt, moocId)
          .input('title', sql.NVarChar, lesson.title)
          .input('contentType', sql.NVarChar, lesson.content_type)
          .input('contentUrl', sql.NVarChar, lesson.content_url)
          .input('orderNo', sql.Int, lesson.order_no)
          .input('isPreview', sql.Bit, lesson.is_preview)
          .query(`
            INSERT INTO lessons (mooc_id, title, content_type, content_url, order_no, is_preview)
            VALUES (@moocId, @title, @contentType, @contentUrl, @orderNo, @isPreview)
          `);
        
        totalLessons++;
        console.log(`    📝 Lesson: ${lesson.title} [${lesson.content_type}]`);
      }

      // Insert exam if specified
      if (mooc.hasExam && mooc.exam) {
        await pool.request()
          .input('moocId', sql.BigInt, moocId)
          .input('name', sql.NVarChar, mooc.exam.name)
          .input('duration', sql.Int, mooc.exam.duration_minutes)
          .input('attempts', sql.Int, mooc.exam.attempts_allowed)
          .input('showAnswers', sql.NVarChar, mooc.exam.show_answers_after)
          .query(`
            INSERT INTO exams (mooc_id, name, duration_minutes, attempts_allowed, show_answers_after, created_at)
            VALUES (@moocId, @name, @duration, @attempts, @showAnswers, GETDATE())
          `);
        
        totalExams++;
        console.log(`    📋 Exam: ${mooc.exam.name}`);
      }

      console.log('');
    }

    console.log('✅ Data insertion completed!\n');
    console.log('📊 Summary:');
    console.log(`  - MOOCs created: ${courseStructure.length}`);
    console.log(`  - Lessons created: ${totalLessons}`);
    console.log(`  - Exams created: ${totalExams}`);
    console.log(`  - Content types: video, reading, quiz, discussion\n`);

  } catch (error) {
    console.error('❌ Error inserting data:', error);
  } finally {
    await sql.close();
  }
}

insertCompleteCourseData();
