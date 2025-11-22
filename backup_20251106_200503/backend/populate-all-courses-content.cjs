const sql = require('mssql');

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

// Sample YouTube videos by topic
const videosByTopic = {
  python: [
    'https://www.youtube.com/embed/kqtD5dpn9C8', // Python for Beginners
    'https://www.youtube.com/embed/rfscVS0vtbw', // Learn Python
    'https://www.youtube.com/embed/_uQrJ0TkZlc', // Python Tutorial
    'https://www.youtube.com/embed/f79MRyMsjrQ', // Python Course
    'https://www.youtube.com/embed/eWRfhZUzrAc', // Python Full Course
  ],
  flutter: [
    'https://www.youtube.com/embed/1ukSR1GRtMU', // Flutter Tutorial
    'https://www.youtube.com/embed/x0uinJvhNxI', // Flutter Course
    'https://www.youtube.com/embed/1gDhl4leEzA', // Flutter Widgets
    'https://www.youtube.com/embed/CD1Y2DmL5JM', // Flutter State
    'https://www.youtube.com/embed/VPvVD8t02U8', // Flutter Navigation
  ],
  ml: [
    'https://www.youtube.com/embed/7eh4d6sabA0', // Machine Learning
    'https://www.youtube.com/embed/aircAruvnKk', // Neural Networks
    'https://www.youtube.com/embed/tPYj3fFJGjk', // TensorFlow
    'https://www.youtube.com/embed/i_LwzRVP7bg', // Deep Learning
    'https://www.youtube.com/embed/Gv9_4yMHFhI', // ML Basics
  ],
  marketing: [
    'https://www.youtube.com/embed/nU-IIXBWlS4', // Digital Marketing
    'https://www.youtube.com/embed/slUjgvjmb40', // SEO Tutorial
    'https://www.youtube.com/embed/d2bYNYt87NY', // Content Marketing
    'https://www.youtube.com/embed/Nqv1s7dLkUo', // Social Media
    'https://www.youtube.com/embed/1p9bGRdvQRo', // Email Marketing
  ],
  design: [
    'https://www.youtube.com/embed/c9Wg6Cb_YlU', // UI/UX Design
    'https://www.youtube.com/embed/0JCUH5daCCE', // Design Principles
    'https://www.youtube.com/embed/6t_SimjETqM', // Figma Tutorial
    'https://www.youtube.com/embed/FTFaQWZBqQ8', // User Research
    'https://www.youtube.com/embed/RFv53AxxQAo', // Prototyping
  ],
  javascript: [
    'https://www.youtube.com/embed/PkZNo7MFNFg', // JavaScript
    'https://www.youtube.com/embed/W6NZfCO5SIk', // JavaScript Tutorial
    'https://www.youtube.com/embed/jS4aFq5-91M', // JavaScript Full Course
    'https://www.youtube.com/embed/Qqx_wzMmFeA', // ES6 Features
    'https://www.youtube.com/embed/DHjqpvDnNGE', // JavaScript Async
  ]
};

function getVideoUrl(courseTopic, index) {
  const videos = videosByTopic[courseTopic] || videosByTopic.python;
  return videos[index % videos.length];
}

function generateReadingContent(lessonTitle, courseTopic) {
  return {
    type: 'article',
    content: `
      <h2>${lessonTitle}</h2>
      
      <h3>Giới thiệu</h3>
      <p>Trong bài học này, chúng ta sẽ tìm hiểu về ${lessonTitle.toLowerCase()}. Đây là một phần quan trọng trong việc học ${courseTopic}.</p>
      
      <h3>Kiến thức chính</h3>
      <ul>
        <li>Khái niệm cơ bản và định nghĩa</li>
        <li>Các nguyên tắc và best practices</li>
        <li>Ví dụ thực tế và ứng dụng</li>
        <li>Lưu ý khi áp dụng trong dự án</li>
      </ul>
      
      <h3>Ví dụ minh họa</h3>
      <pre><code>// Example code here
const example = "This is a sample code snippet";
console.log(example);
      </code></pre>
      
      <h3>Tổng kết</h3>
      <p>Qua bài học này, bạn đã nắm được những kiến thức cơ bản về ${lessonTitle.toLowerCase()}. Hãy thực hành thêm để hiểu sâu hơn!</p>
      
      <h3>Bài tập</h3>
      <p>Hãy thử áp dụng kiến thức vừa học vào một ví dụ cụ thể của riêng bạn.</p>
    `
  };
}

function generateQuizContent(lessonTitle) {
  return {
    type: 'quiz',
    quiz_id: null,
    description: `Kiểm tra kiến thức về ${lessonTitle}`,
    timeLimit: 10,
    passingScore: 70,
    questions: [
      {
        id: 1,
        question: `Câu hỏi cơ bản về ${lessonTitle}?`,
        options: [
          'Đáp án A - Đúng',
          'Đáp án B - Sai',
          'Đáp án C - Sai',
          'Đáp án D - Sai'
        ],
        correctAnswer: 0
      },
      {
        id: 2,
        question: `Điều nào quan trọng nhất khi học ${lessonTitle}?`,
        options: [
          'Đáp án A - Sai',
          'Đáp án B - Đúng',
          'Đáp án C - Sai',
          'Đáp án D - Sai'
        ],
        correctAnswer: 1
      },
      {
        id: 3,
        question: `Ứng dụng thực tế của ${lessonTitle} là gì?`,
        options: [
          'Đáp án A - Sai',
          'Đáp án B - Sai',
          'Đáp án C - Đúng',
          'Đáp án D - Sai'
        ],
        correctAnswer: 2
      }
    ]
  };
}

function generateDiscussionContent(lessonTitle) {
  return {
    type: 'forum',
    topic: lessonTitle,
    description: `Thảo luận về ${lessonTitle}. Hãy chia sẻ ý kiến, kinh nghiệm và đặt câu hỏi với cộng đồng.`,
    guidelines: [
      'Tôn trọng ý kiến của người khác',
      'Đặt câu hỏi rõ ràng và cụ thể',
      'Chia sẻ kinh nghiệm thực tế',
      'Giúp đỡ các học viên khác'
    ]
  };
}

function generateAssignmentContent(lessonTitle, courseTopic) {
  return {
    type: 'assignment',
    title: lessonTitle,
    description: `Hoàn thành bài tập về ${lessonTitle}`,
    instructions: `
      <h3>Yêu cầu:</h3>
      <ol>
        <li>Áp dụng kiến thức đã học về ${lessonTitle}</li>
        <li>Tạo một project nhỏ minh họa</li>
        <li>Viết báo cáo giải thích cách làm</li>
        <li>Nộp bài qua hệ thống</li>
      </ol>
      
      <h3>Tiêu chí đánh giá:</h3>
      <ul>
        <li>Tính đúng đắn của code (40%)</li>
        <li>Tính sáng tạo (30%)</li>
        <li>Documentation và báo cáo (30%)</li>
      </ul>
      
      <h3>Thời gian:</h3>
      <p>1 tuần kể từ khi bắt đầu bài học</p>
    `,
    deadline: null,
    maxScore: 100
  };
}

(async () => {
  try {
    const pool = await sql.connect(config);
    
    // Get all lessons with NULL content_url
    const nullLessons = await pool.request()
      .query(`
        SELECT l.lesson_id, l.title, l.content_type, l.mooc_id, c.course_id, c.title as course_title
        FROM lessons l
        JOIN moocs m ON l.mooc_id = m.mooc_id
        JOIN courses c ON m.course_id = c.course_id
        WHERE l.content_url IS NULL OR l.content_url = 'N/A'
        ORDER BY c.course_id, l.mooc_id, l.order_no
      `);

    console.log(`📝 Found ${nullLessons.recordset.length} lessons with NULL content_url`);
    console.log('Starting to populate content...\n');

    const topicMap = {
      3: 'python',
      4: 'flutter',
      5: 'ml',
      6: 'marketing',
      7: 'design',
      8: 'javascript'
    };

    let updated = 0;
    let videoIndex = 0;

    for (const lesson of nullLessons.recordset) {
      const courseTopic = topicMap[lesson.course_id] || 'python';
      let contentUrl = null;

      switch (lesson.content_type) {
        case 'video':
          contentUrl = getVideoUrl(courseTopic, videoIndex++);
          break;

        case 'reading':
          contentUrl = JSON.stringify(generateReadingContent(lesson.title, courseTopic));
          break;

        case 'quiz':
          contentUrl = JSON.stringify(generateQuizContent(lesson.title));
          break;

        case 'discussion':
          contentUrl = JSON.stringify(generateDiscussionContent(lesson.title));
          break;

        case 'assignment':
          contentUrl = JSON.stringify(generateAssignmentContent(lesson.title, courseTopic));
          break;

        default:
          console.log(`⚠️ Unknown content_type: ${lesson.content_type} for lesson ${lesson.lesson_id}`);
          continue;
      }

      if (contentUrl) {
        await pool.request()
          .input('lesson_id', sql.BigInt, lesson.lesson_id)
          .input('content_url', sql.NVarChar(sql.MAX), contentUrl)
          .query('UPDATE lessons SET content_url = @content_url WHERE lesson_id = @lesson_id');

        updated++;
        console.log(`✅ Updated Lesson ${lesson.lesson_id} (${lesson.content_type}): ${lesson.title}`);
      }
    }

    console.log(`\n🎉 Successfully updated ${updated}/${nullLessons.recordset.length} lessons!`);
    
    await pool.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  }
})();
