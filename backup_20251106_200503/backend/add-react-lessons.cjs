const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'MiniCoursera_Primary',
  user: 'sa',
  password: '123456',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

// Dữ liệu bài học cho Course 2 - Complete React Developer Course
const reactLessons = [
  {
    mooc_id: 3,
    title: "Welcome to React Development",
    content_type: "video",
    content_url: "https://www.youtube.com/embed/w7ejDZ8SWv8",
    order_no: 1,
    is_preview: true
  },
  {
    mooc_id: 3,
    title: "Setting Up Development Environment",
    content_type: "reading",
    content_url: JSON.stringify({
      type: "article",
      content: `
        <h2>Setting Up Your React Development Environment</h2>
        
        <h3>Prerequisites</h3>
        <ul>
          <li>Node.js (v14 or higher)</li>
          <li>npm or yarn package manager</li>
          <li>Code editor (VS Code recommended)</li>
        </ul>
        
        <h3>Installation Steps</h3>
        <ol>
          <li>Install Node.js from nodejs.org</li>
          <li>Verify installation: <code>node --version</code></li>
          <li>Install create-react-app globally: <code>npm install -g create-react-app</code></li>
          <li>Create your first project: <code>npx create-react-app my-app</code></li>
        </ol>
        
        <h3>VS Code Extensions</h3>
        <ul>
          <li>ES7+ React/Redux/React-Native snippets</li>
          <li>Prettier - Code formatter</li>
          <li>ESLint</li>
        </ul>
      `
    }),
    order_no: 2,
    is_preview: true
  },
  {
    mooc_id: 3,
    title: "Your First React Component",
    content_type: "video",
    content_url: "https://www.youtube.com/embed/Ke90Tje7VS0",
    order_no: 3,
    is_preview: false
  },
  {
    mooc_id: 3,
    title: "JSX Syntax and Basics",
    content_type: "video",
    content_url: "https://www.youtube.com/embed/7fPXI_MnBOY",
    order_no: 4,
    is_preview: false
  },
  {
    mooc_id: 3,
    title: "Understanding Props",
    content_type: "reading",
    content_url: JSON.stringify({
      type: "article",
      content: `
        <h2>React Props (Properties)</h2>
        
        <h3>What are Props?</h3>
        <p>Props are arguments passed into React components, similar to function parameters.</p>
        
        <h3>Passing Props</h3>
        <pre><code>function Welcome(props) {
  return &lt;h1&gt;Hello, {props.name}&lt;/h1&gt;;
}

// Using the component
&lt;Welcome name="Sara" /&gt;
        </code></pre>
        
        <h3>Props are Read-Only</h3>
        <p>Components must never modify their own props. They should act like pure functions.</p>
        
        <h3>Default Props</h3>
        <pre><code>Welcome.defaultProps = {
  name: 'Guest'
};
        </code></pre>
      `
    }),
    order_no: 5,
    is_preview: false
  },
  {
    mooc_id: 3,
    title: "State Management Basics",
    content_type: "video",
    content_url: "https://www.youtube.com/embed/4pO-HcG2igk",
    order_no: 6,
    is_preview: false
  },
  {
    mooc_id: 3,
    title: "useState Hook Deep Dive",
    content_type: "video",
    content_url: "https://www.youtube.com/embed/O6P86uwfdR0",
    order_no: 7,
    is_preview: false
  },
  {
    mooc_id: 3,
    title: "Event Handling in React",
    content_type: "reading",
    content_url: JSON.stringify({
      type: "article",
      content: `
        <h2>Handling Events in React</h2>
        
        <h3>Basic Event Handling</h3>
        <pre><code>function Button() {
  const handleClick = () => {
    console.log('Button clicked!');
  };
  
  return &lt;button onClick={handleClick}&gt;Click me&lt;/button&gt;;
}
        </code></pre>
        
        <h3>Event Object</h3>
        <pre><code>function Form() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
  };
  
  return &lt;form onSubmit={handleSubmit}&gt;...&lt;/form&gt;;
}
        </code></pre>
        
        <h3>Common Events</h3>
        <ul>
          <li>onClick</li>
          <li>onChange</li>
          <li>onSubmit</li>
          <li>onMouseEnter/onMouseLeave</li>
          <li>onFocus/onBlur</li>
        </ul>
      `
    }),
    order_no: 8,
    is_preview: false
  },
  {
    mooc_id: 3,
    title: "Conditional Rendering",
    content_type: "video",
    content_url: "https://www.youtube.com/embed/4ORZ1GmjaMc",
    order_no: 9,
    is_preview: false
  },
  {
    mooc_id: 3,
    title: "Lists and Keys",
    content_type: "video",
    content_url: "https://www.youtube.com/embed/0sasRxl35_8",
    order_no: 10,
    is_preview: false
  },
  {
    mooc_id: 3,
    title: "Forms in React",
    content_type: "reading",
    content_url: JSON.stringify({
      type: "article",
      content: `
        <h2>Working with Forms in React</h2>
        
        <h3>Controlled Components</h3>
        <pre><code>function NameForm() {
  const [value, setValue] = useState('');
  
  const handleChange = (e) => {
    setValue(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Submitted: ' + value);
  };
  
  return (
    &lt;form onSubmit={handleSubmit}&gt;
      &lt;input 
        type="text" 
        value={value} 
        onChange={handleChange} 
      /&gt;
      &lt;button type="submit"&gt;Submit&lt;/button&gt;
    &lt;/form&gt;
  );
}
        </code></pre>
        
        <h3>Multiple Inputs</h3>
        <p>Use a single state object and input names to handle multiple inputs.</p>
      `
    }),
    order_no: 11,
    is_preview: false
  },
  {
    mooc_id: 3,
    title: "Practice: Build a Todo App",
    content_type: "discussion",
    content_url: JSON.stringify({
      type: "forum",
      topic: "Build Your First React Todo App",
      description: "Create a simple todo application using what you've learned. Share your code and get feedback from peers."
    }),
    order_no: 12,
    is_preview: false
  },
  {
    mooc_id: 3,
    title: "React Quiz: Fundamentals",
    content_type: "quiz",
    content_url: JSON.stringify({
      type: "quiz",
      quiz_id: null, // Will be updated if you have exam system
      description: "Test your understanding of React fundamentals"
    }),
    order_no: 13,
    is_preview: false
  }
];

async function addLessons() {
  try {
    console.log('🔌 Connecting to database...');
    const pool = await sql.connect(config);
    console.log('✅ Connected!\n');

    console.log('📚 Adding React lessons to Course 2...\n');

    for (const lesson of reactLessons) {
      try {
        const result = await pool.request()
          .input('mooc_id', sql.BigInt, lesson.mooc_id)
          .input('title', sql.NVarChar, lesson.title)
          .input('content_type', sql.VarChar, lesson.content_type)
          .input('content_url', sql.NVarChar(sql.MAX), lesson.content_url)
          .input('order_no', sql.Int, lesson.order_no)
          .input('is_preview', sql.Bit, lesson.is_preview)
          .query(`
            INSERT INTO lessons (mooc_id, title, content_type, content_url, order_no, is_preview)
            VALUES (@mooc_id, @title, @content_type, @content_url, @order_no, @is_preview);
            SELECT SCOPE_IDENTITY() as lesson_id;
          `);

        const lessonId = result.recordset[0].lesson_id;
        console.log(`✅ Added: [${lessonId}] ${lesson.title} (${lesson.content_type})`);
      } catch (err) {
        console.error(`❌ Failed to add: ${lesson.title}`);
        console.error(err.message);
      }
    }

    console.log('\n📊 Verifying data...');
    const verify = await pool.request()
      .input('mooc_id', sql.BigInt, 3)
      .query('SELECT COUNT(*) as count FROM lessons WHERE mooc_id = @mooc_id');
    
    console.log(`✅ Total lessons for Course 2: ${verify.recordset[0].count}`);

    await pool.close();
    console.log('\n🎉 Done! React course now has lessons.');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  }
}

// Run the script
addLessons();
