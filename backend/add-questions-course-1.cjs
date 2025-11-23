const sql = require('mssql');

const config = {
  user: 'sa',
  password: '123456',
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

// Java Servlet questions (need 8 more to reach 10)
const javaServletQuestions = [
  {
    mooc_id: 1,
    stem: 'What is the main purpose of a Servlet in Java web development?',
    qtype: 'mcq',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'To handle HTTP requests and responses', is_correct: true },
      { label: 'B', content: 'To create desktop applications', is_correct: false },
      { label: 'C', content: 'To manage database connections only', is_correct: false },
      { label: 'D', content: 'To compile Java code', is_correct: false }
    ]
  },
  {
    mooc_id: 1,
    stem: 'Which method is called when a Servlet is first loaded?',
    qtype: 'mcq',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'doGet()', is_correct: false },
      { label: 'B', content: 'init()', is_correct: true },
      { label: 'C', content: 'service()', is_correct: false },
      { label: 'D', content: 'destroy()', is_correct: false }
    ]
  },
  {
    mooc_id: 1,
    stem: 'What is the purpose of the web.xml file in a Servlet application?',
    qtype: 'mcq',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'To store database credentials', is_correct: false },
      { label: 'B', content: 'To configure servlets and their mappings', is_correct: true },
      { label: 'C', content: 'To write Java code', is_correct: false },
      { label: 'D', content: 'To style web pages', is_correct: false }
    ]
  },
  {
    mooc_id: 1,
    stem: 'Which HTTP method is typically used to retrieve data from a server?',
    qtype: 'mcq',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'POST', is_correct: false },
      { label: 'B', content: 'GET', is_correct: true },
      { label: 'C', content: 'DELETE', is_correct: false },
      { label: 'D', content: 'PUT', is_correct: false }
    ]
  },
  {
    mooc_id: 1,
    stem: 'What does HttpServletRequest object provide?',
    qtype: 'mcq',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Information about the client request', is_correct: true },
      { label: 'B', content: 'Database connection', is_correct: false },
      { label: 'C', content: 'Server configuration', is_correct: false },
      { label: 'D', content: 'Email sending functionality', is_correct: false }
    ]
  },
  {
    mooc_id: 1,
    stem: 'Which annotation is used to map a servlet to a URL pattern in modern servlets?',
    qtype: 'mcq',
    difficulty: 'medium',
    options: [
      { label: 'A', content: '@WebServlet', is_correct: true },
      { label: 'B', content: '@ServletMapping', is_correct: false },
      { label: 'C', content: '@URLPattern', is_correct: false },
      { label: 'D', content: '@HTTPServlet', is_correct: false }
    ]
  },
  {
    mooc_id: 1,
    stem: 'What is a Session in servlet programming?',
    qtype: 'mcq',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'A way to maintain state across multiple requests', is_correct: true },
      { label: 'B', content: 'A type of database', is_correct: false },
      { label: 'C', content: 'A Java class', is_correct: false },
      { label: 'D', content: 'A server configuration file', is_correct: false }
    ]
  },
  {
    mooc_id: 1,
    stem: 'Which method is used to forward a request to another resource?',
    qtype: 'mcq',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'sendRedirect()', is_correct: false },
      { label: 'B', content: 'RequestDispatcher.forward()', is_correct: true },
      { label: 'C', content: 'response.forward()', is_correct: false },
      { label: 'D', content: 'request.transfer()', is_correct: false }
    ]
  }
];

// React questions (need 10 new questions)
const reactQuestions = [
  {
    mooc_id: 2,
    stem: 'What is React primarily used for?',
    qtype: 'mcq',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'Building user interfaces', is_correct: true },
      { label: 'B', content: 'Managing databases', is_correct: false },
      { label: 'C', content: 'Server-side programming', is_correct: false },
      { label: 'D', content: 'Creating mobile apps only', is_correct: false }
    ]
  },
  {
    mooc_id: 2,
    stem: 'What is JSX in React?',
    qtype: 'mcq',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'A syntax extension that looks like HTML', is_correct: true },
      { label: 'B', content: 'A new programming language', is_correct: false },
      { label: 'C', content: 'A database query language', is_correct: false },
      { label: 'D', content: 'A CSS framework', is_correct: false }
    ]
  },
  {
    mooc_id: 2,
    stem: 'What is a React component?',
    qtype: 'mcq',
    difficulty: 'easy',
    options: [
      { label: 'A', content: 'A reusable piece of UI', is_correct: true },
      { label: 'B', content: 'A database table', is_correct: false },
      { label: 'C', content: 'A server endpoint', is_correct: false },
      { label: 'D', content: 'A CSS class', is_correct: false }
    ]
  },
  {
    mooc_id: 2,
    stem: 'What hook is used to manage state in functional components?',
    qtype: 'mcq',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'useState', is_correct: true },
      { label: 'B', content: 'useEffect', is_correct: false },
      { label: 'C', content: 'useContext', is_correct: false },
      { label: 'D', content: 'useReducer', is_correct: false }
    ]
  },
  {
    mooc_id: 2,
    stem: 'What does the useEffect hook do?',
    qtype: 'mcq',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Performs side effects in components', is_correct: true },
      { label: 'B', content: 'Manages component state', is_correct: false },
      { label: 'C', content: 'Creates new components', is_correct: false },
      { label: 'D', content: 'Styles components', is_correct: false }
    ]
  },
  {
    mooc_id: 2,
    stem: 'How do you pass data from parent to child component in React?',
    qtype: 'mcq',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Using props', is_correct: true },
      { label: 'B', content: 'Using state', is_correct: false },
      { label: 'C', content: 'Using refs', is_correct: false },
      { label: 'D', content: 'Using context only', is_correct: false }
    ]
  },
  {
    mooc_id: 2,
    stem: 'What is the Virtual DOM in React?',
    qtype: 'mcq',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'A lightweight copy of the actual DOM', is_correct: true },
      { label: 'B', content: 'A database structure', is_correct: false },
      { label: 'C', content: 'A server-side component', is_correct: false },
      { label: 'D', content: 'A CSS framework', is_correct: false }
    ]
  },
  {
    mooc_id: 2,
    stem: 'Which method is called after a component is rendered for the first time?',
    qtype: 'mcq',
    difficulty: 'hard',
    options: [
      { label: 'A', content: 'componentDidMount', is_correct: true },
      { label: 'B', content: 'componentWillMount', is_correct: false },
      { label: 'C', content: 'componentDidUpdate', is_correct: false },
      { label: 'D', content: 'render', is_correct: false }
    ]
  },
  {
    mooc_id: 2,
    stem: 'What is the purpose of keys in React lists?',
    qtype: 'mcq',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'To help React identify which items have changed', is_correct: true },
      { label: 'B', content: 'To style list items', is_correct: false },
      { label: 'C', content: 'To sort the list', is_correct: false },
      { label: 'D', content: 'To filter data', is_correct: false }
    ]
  },
  {
    mooc_id: 2,
    stem: 'What is React Router used for?',
    qtype: 'mcq',
    difficulty: 'medium',
    options: [
      { label: 'A', content: 'Handling navigation in single-page applications', is_correct: true },
      { label: 'B', content: 'Managing component state', is_correct: false },
      { label: 'C', content: 'Styling components', is_correct: false },
      { label: 'D', content: 'Making API calls', is_correct: false }
    ]
  }
];

async function addQuestions() {
  try {
    console.log('🚀 Adding questions to Course 1...\n');
    console.log('=' .repeat(80));

    const pool = await sql.connect(config);

    // Add Java Servlet questions
    console.log('\n📚 Adding Java Servlet questions (MOOC 1)...');
    console.log('=' .repeat(80));
    
    for (const question of javaServletQuestions) {
      // Insert question
      const questionResult = await pool.request()
        .input('moocId', sql.Int, question.mooc_id)
        .input('stem', sql.NVarChar, question.stem)
        .input('qtype', sql.NVarChar, question.qtype)
        .input('difficulty', sql.NVarChar, question.difficulty)
        .query(`
          INSERT INTO questions (mooc_id, stem, qtype, difficulty)
          OUTPUT INSERTED.question_id
          VALUES (@moocId, @stem, @qtype, @difficulty)
        `);

      const questionId = questionResult.recordset[0].question_id;

      // Insert options
      for (const option of question.options) {
        await pool.request()
          .input('questionId', sql.Int, questionId)
          .input('label', sql.NVarChar, option.label)
          .input('content', sql.NVarChar, option.content)
          .input('isCorrect', sql.Bit, option.is_correct)
          .query(`
            INSERT INTO question_options (question_id, label, content, is_correct)
            VALUES (@questionId, @label, @content, @isCorrect)
          `);
      }

      console.log(`✓ Added question ${questionId}: ${question.stem.substring(0, 50)}...`);
    }

    // Add React questions
    console.log('\n📚 Adding React questions (MOOC 2)...');
    console.log('=' .repeat(80));
    
    for (const question of reactQuestions) {
      // Insert question
      const questionResult = await pool.request()
        .input('moocId', sql.Int, question.mooc_id)
        .input('stem', sql.NVarChar, question.stem)
        .input('qtype', sql.NVarChar, question.qtype)
        .input('difficulty', sql.NVarChar, question.difficulty)
        .query(`
          INSERT INTO questions (mooc_id, stem, qtype, difficulty)
          OUTPUT INSERTED.question_id
          VALUES (@moocId, @stem, @qtype, @difficulty)
        `);

      const questionId = questionResult.recordset[0].question_id;

      // Insert options
      for (const option of question.options) {
        await pool.request()
          .input('questionId', sql.Int, questionId)
          .input('label', sql.NVarChar, option.label)
          .input('content', sql.NVarChar, option.content)
          .input('isCorrect', sql.Bit, option.is_correct)
          .query(`
            INSERT INTO question_options (question_id, label, content, is_correct)
            VALUES (@questionId, @label, @content, @isCorrect)
          `);
      }

      console.log(`✓ Added question ${questionId}: ${question.stem.substring(0, 50)}...`);
    }

    // Verify
    console.log('\n\n📊 Verification:');
    console.log('=' .repeat(80));
    
    const mooc1Count = await pool.request()
      .input('moocId', sql.Int, 1)
      .query('SELECT COUNT(*) as count FROM questions WHERE mooc_id = @moocId');
    
    const mooc2Count = await pool.request()
      .input('moocId', sql.Int, 2)
      .query('SELECT COUNT(*) as count FROM questions WHERE mooc_id = @moocId');

    console.log(`✅ MOOC 1 (Java Servlet): ${mooc1Count.recordset[0].count} questions`);
    console.log(`✅ MOOC 2 (React Cơ bản): ${mooc2Count.recordset[0].count} questions`);

    console.log('\n✨ Done! Course 1 now has complete questions for exams.');

    await pool.close();

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

addQuestions();
