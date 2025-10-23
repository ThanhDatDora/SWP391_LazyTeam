import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock users data
const users = [
  {
    user_id: 1,
    email: 'learner@example.com',
    password: 'Learner@123', // In real app this would be hashed
    full_name: 'Learner User',
    role: 'learner'
  },
  {
    user_id: 2,
    email: 'instructor@example.com', 
    password: 'Instructor@123',
    full_name: 'Instructor User',
    role: 'instructor'
  },
  {
    user_id: 3,
    email: 'admin@example.com',
    password: 'Admin@123', 
    full_name: 'Admin User',
    role: 'admin'
  }
];

// Mock courses data
const courses = [
  {
    course_id: 1,
    title: 'Introduction to React',
    description: 'Learn the basics of React development',
    instructor: 'John Doe',
    price: 99.99,
    image_url: 'https://via.placeholder.com/300x200?text=React+Course',
    category: 'Web Development',
    rating: 4.5,
    students_count: 1250,
    duration: '8 weeks'
  },
  {
    course_id: 2,
    title: 'Advanced JavaScript',
    description: 'Master advanced JavaScript concepts',
    instructor: 'Jane Smith',
    price: 129.99,
    image_url: 'https://via.placeholder.com/300x200?text=JavaScript+Course',
    category: 'Programming',
    rating: 4.7,
    students_count: 890,
    duration: '10 weeks'
  },
  {
    course_id: 3,
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications',
    instructor: 'Mike Johnson',
    price: 149.99,
    image_url: 'https://via.placeholder.com/300x200?text=Node.js+Course',
    category: 'Backend',
    rating: 4.6,
    students_count: 675,
    duration: '12 weeks'
  }
];

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Simple server is running!',
    timestamp: new Date().toISOString()
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('📥 Login request:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: {
        type: 'VALIDATION_ERROR',
        code: 2001,
        message: 'Email and password are required'
      }
    });
  }
  
  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        type: 'AUTHENTICATION_ERROR',
        code: 1001,
        message: 'Invalid email or password'
      }
    });
  }
  
  // Create mock token
  const token = `mock_token_${user.user_id}_${Date.now()}`;
  
  res.json({
    success: true,
    data: {
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      token,
      expiresIn: '24h'
    }
  });
});

// Get courses endpoint
app.get('/api/courses', (req, res) => {
  console.log('📥 Courses request');
  
  res.json({
    success: true,
    data: {
      courses,
      total: courses.length,
      page: 1,
      limit: 10
    }
  });
});

// Get course by ID
app.get('/api/courses/:id', (req, res) => {
  const courseId = parseInt(req.params.id);
  const course = courses.find(c => c.course_id === courseId);
  
  if (!course) {
    return res.status(404).json({
      success: false,
      error: {
        type: 'NOT_FOUND_ERROR',
        code: 3001,
        message: 'Course not found'
      }
    });
  }
  
  res.json({
    success: true,
    data: { course }
  });
});

app.listen(PORT, () => {
  console.log(`Simple server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET /api/health');
  console.log('- POST /api/auth/login');
  console.log('- GET /api/courses');
  console.log('- GET /api/courses/:id');
});