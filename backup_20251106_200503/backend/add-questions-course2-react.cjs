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

// Course 2: Complete React Developer Course - MOOC 3: Introduction & Setup
const questions = [
  {
    mooc_id: 3,
    stem: 'React là gì?',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Một thư viện JavaScript để xây dựng giao diện người dùng', is_correct: true },
      { label: 'B', content: 'Một framework backend cho Node.js', is_correct: false },
      { label: 'C', content: 'Một ngôn ngữ lập trình mới', is_correct: false },
      { label: 'D', content: 'Một cơ sở dữ liệu NoSQL', is_correct: false }
    ]
  },
  {
    mooc_id: 3,
    stem: 'React được phát triển bởi công ty nào?',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Google', is_correct: false },
      { label: 'B', content: 'Facebook (Meta)', is_correct: true },
      { label: 'C', content: 'Microsoft', is_correct: false },
      { label: 'D', content: 'Apple', is_correct: false }
    ]
  },
  {
    mooc_id: 3,
    stem: 'JSX là gì trong React?',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Một cú pháp mở rộng của JavaScript cho phép viết HTML trong JavaScript', is_correct: true },
      { label: 'B', content: 'Một thư viện CSS-in-JS', is_correct: false },
      { label: 'C', content: 'Một công cụ testing', is_correct: false },
      { label: 'D', content: 'Một package manager', is_correct: false }
    ]
  },
  {
    mooc_id: 3,
    stem: 'Để tạo một React app mới, lệnh nào được sử dụng phổ biến nhất?',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'npm init react', is_correct: false },
      { label: 'B', content: 'create-react-app my-app', is_correct: true },
      { label: 'C', content: 'react new app', is_correct: false },
      { label: 'D', content: 'npm start react', is_correct: false }
    ]
  },
  {
    mooc_id: 3,
    stem: 'Virtual DOM trong React là gì?',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Một bản sao nhẹ của DOM thực được React sử dụng để tối ưu hiệu năng', is_correct: true },
      { label: 'B', content: 'Một DOM ảo chỉ tồn tại trong bộ nhớ cache', is_correct: false },
      { label: 'C', content: 'Một công nghệ VR để render 3D', is_correct: false },
      { label: 'D', content: 'Một plugin của trình duyệt', is_correct: false }
    ]
  },
  {
    mooc_id: 3,
    stem: 'Component trong React có thể được tạo bằng cách nào?',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Chỉ có thể dùng Class Component', is_correct: false },
      { label: 'B', content: 'Chỉ có thể dùng Function Component', is_correct: false },
      { label: 'C', content: 'Cả Class Component và Function Component', is_correct: true },
      { label: 'D', content: 'Chỉ có thể dùng Arrow Function', is_correct: false }
    ]
  },
  {
    mooc_id: 3,
    stem: 'Props trong React dùng để làm gì?',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Truyền dữ liệu từ component cha sang component con', is_correct: true },
      { label: 'B', content: 'Lưu trữ state cục bộ', is_correct: false },
      { label: 'C', content: 'Gọi API', is_correct: false },
      { label: 'D', content: 'Định nghĩa CSS styles', is_correct: false }
    ]
  },
  {
    mooc_id: 3,
    stem: 'State trong React khác Props như thế nào?',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'State có thể thay đổi, Props là read-only', is_correct: true },
      { label: 'B', content: 'Props có thể thay đổi, State là read-only', is_correct: false },
      { label: 'C', content: 'Không có sự khác biệt', is_correct: false },
      { label: 'D', content: 'State chỉ dùng cho Class Component', is_correct: false }
    ]
  },
  {
    mooc_id: 3,
    stem: 'Trong React, file package.json dùng để làm gì?',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Quản lý dependencies và scripts của project', is_correct: true },
      { label: 'B', content: 'Chứa source code chính', is_correct: false },
      { label: 'C', content: 'Cấu hình CSS', is_correct: false },
      { label: 'D', content: 'Lưu trữ database connection', is_correct: false }
    ]
  },
  {
    mooc_id: 3,
    stem: 'npm install làm gì?',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Cài đặt tất cả dependencies trong package.json', is_correct: true },
      { label: 'B', content: 'Chạy ứng dụng React', is_correct: false },
      { label: 'C', content: 'Build production', is_correct: false },
      { label: 'D', content: 'Xóa node_modules', is_correct: false }
    ]
  },
  {
    mooc_id: 3,
    stem: 'Babel trong React ecosystem dùng để làm gì?',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Transpile JSX và ES6+ code thành JavaScript tương thích với trình duyệt', is_correct: true },
      { label: 'B', content: 'Bundle các file lại với nhau', is_correct: false },
      { label: 'C', content: 'Test React components', is_correct: false },
      { label: 'D', content: 'Quản lý state toàn cục', is_correct: false }
    ]
  },
  {
    mooc_id: 3,
    stem: 'Webpack trong React dùng để làm gì?',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Module bundler - gom tất cả file JS, CSS, images thành bundle', is_correct: true },
      { label: 'B', content: 'Transpile JSX', is_correct: false },
      { label: 'C', content: 'Testing framework', is_correct: false },
      { label: 'D', content: 'State management library', is_correct: false }
    ]
  },
  {
    mooc_id: 3,
    stem: 'React Developer Tools là gì?',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Extension trình duyệt để debug React applications', is_correct: true },
      { label: 'B', content: 'Một IDE cho React', is_correct: false },
      { label: 'C', content: 'Một thư viện UI components', is_correct: false },
      { label: 'D', content: 'Một framework CSS', is_correct: false }
    ]
  },
  {
    mooc_id: 3,
    stem: 'Node.js có vai trò gì trong React development?',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Cung cấp môi trường runtime để chạy build tools và dev server', is_correct: true },
      { label: 'B', content: 'Chạy React code trên production', is_correct: false },
      { label: 'C', content: 'Thay thế cho trình duyệt', is_correct: false },
      { label: 'D', content: 'Không cần thiết cho React', is_correct: false }
    ]
  },
  {
    mooc_id: 3,
    stem: 'Trong React, file public/index.html có vai trò gì?',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'File HTML gốc chứa <div id="root"> nơi React app được mount', is_correct: true },
      { label: 'B', content: 'File cấu hình routing', is_correct: false },
      { label: 'C', content: 'File chứa toàn bộ JSX code', is_correct: false },
      { label: 'D', content: 'File không quan trọng, có thể xóa', is_correct: false }
    ]
  }
];

async function addQuestions() {
  try {
    const pool = await sql.connect(config);

    console.log(`\n🚀 Adding questions for Course 2: Complete React Developer Course`);
    console.log(`📝 MOOC 3: Introduction & Setup - ${questions.length} questions\n`);

    let addedCount = 0;

    for (const q of questions) {
      // Insert question
      const questionResult = await pool.request()
        .input('mooc_id', sql.BigInt, q.mooc_id)
        .input('stem', sql.NVarChar, q.stem)
        .input('qtype', sql.NVarChar, 'mcq')
        .input('difficulty', sql.NVarChar, q.difficulty)
        .input('max_score', sql.Decimal(5, 2), 1.00)
        .query(`
          INSERT INTO questions (mooc_id, stem, qtype, difficulty, max_score, created_at)
          OUTPUT INSERTED.question_id
          VALUES (@mooc_id, @stem, @qtype, @difficulty, @max_score, GETDATE())
        `);

      const questionId = questionResult.recordset[0].question_id;

      // Insert options
      for (const opt of q.options) {
        await pool.request()
          .input('question_id', sql.BigInt, questionId)
          .input('label', sql.NVarChar, opt.label)
          .input('content', sql.NVarChar, opt.content)
          .input('is_correct', sql.Bit, opt.is_correct ? 1 : 0)
          .query(`
            INSERT INTO question_options (question_id, label, content, is_correct)
            VALUES (@question_id, @label, @content, @is_correct)
          `);
      }

      addedCount++;
      console.log(`✅ Added: "${q.stem.substring(0, 60)}..." (${q.difficulty})`);
    }

    console.log(`\n✨ Successfully added ${addedCount} questions to Course 2!`);

    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addQuestions();
