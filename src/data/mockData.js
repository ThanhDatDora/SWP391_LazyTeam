// Mock data for the Mini-Coursera application

export const ROLES = ['learner', 'instructor', 'admin'];

export const USERS = [
  { id: 1, name: 'Admin FPTU', role: 'admin' },
  { id: 2, name: 'GV. Nguyễn Văn A', role: 'instructor' },
  { id: 3, name: 'SV. Nguyễn Văn B', role: 'learner' }
];

export const CATEGORIES = [
  { id: 1, name: 'Programming' },
  { id: 2, name: 'Data Science' },
  { id: 3, name: 'Design' }
];

export const TAGS = [
  { id: 1, name: 'Java' },
  { id: 2, name: 'React' },
  { id: 3, name: 'Servlet' },
  { id: 4, name: 'Backend' },
  { id: 5, name: 'Web' },
  { id: 8, name: 'Literature' }
];

export const COURSES = [
  {
    id: 1,
    title: 'Java Servlet & React Web Dev',
    description: 'Servlet/Jakarta EE + React + SQL Server.',
    categoryId: 1,
    tagIds: [1, 2, 3, 4, 5],
    ownerInstructorId: 2,
    language: 'vi',
    level: 'beginner',
    price: 990000,
    status: 'published',
    approvedByAdminId: 1,
    startAt: new Date().toISOString(),
    endAt: null,
    rating: 4.7,
    learners: 231,
    duration: '6h 30m'
  },
  {
    id: 2,
    title: 'Literature 101 — Critical Reading',
    description: 'Explore literature fundamentals.',
    categoryId: 3,
    tagIds: [8],
    ownerInstructorId: 2,
    language: 'en',
    level: 'beginner',
    price: 240000,
    status: 'published',
    approvedByAdminId: 1,
    startAt: new Date().toISOString(),
    endAt: null,
    rating: 4.9,
    learners: 1592,
    duration: '9 lessons'
  }
];

export const MOOCS = [
  {
    id: 1,
    courseId: 1,
    title: 'Java Servlet Cơ bản',
    orderNo: 1,
    passMark: 60,
    examOpenAt: '2025-10-10T00:00:00Z',
    examCloseAt: '2025-11-30T00:00:00Z'
  },
  {
    id: 2,
    courseId: 1,
    title: 'React Cơ bản',
    orderNo: 2,
    passMark: 60,
    examOpenAt: '2025-11-01T00:00:00Z',
    examCloseAt: '2025-12-15T00:00:00Z'
  }
];

export const LESSONS = [
  {
    id: 1,
    moocId: 1,
    title: 'Giới thiệu Servlet & Tomcat',
    contentType: 'video',
    contentUrl: '#',
    orderNo: 1,
    isPreview: true
  },
  {
    id: 2,
    moocId: 1,
    title: 'Lifecycle & Request/Response',
    contentType: 'pdf',
    contentUrl: '#',
    orderNo: 2,
    isPreview: false
  },
  {
    id: 3,
    moocId: 2,
    title: 'Giới thiệu React & Vite',
    contentType: 'video',
    contentUrl: '#',
    orderNo: 1,
    isPreview: true
  },
  {
    id: 4,
    moocId: 2,
    title: 'State & Props cơ bản',
    contentType: 'pdf',
    contentUrl: '#',
    orderNo: 2,
    isPreview: false
  }
];

export const QUESTIONS = [
  {
    id: 1,
    moocId: 1,
    type: 'mcq',
    stem: 'Giao thức nào thường dùng với Servlet?',
    options: [
      { id: 11, label: 'A', text: 'HTTP', correct: true },
      { id: 12, label: 'B', text: 'FTP', correct: false },
      { id: 13, label: 'C', text: 'SMTP', correct: false },
      { id: 14, label: 'D', text: 'POP3', correct: false }
    ]
  },
  {
    id: 2,
    moocId: 1,
    type: 'mcq',
    stem: 'Tập tin cấu hình web cổ điển là?',
    options: [
      { id: 21, label: 'A', text: 'server.xml', correct: false },
      { id: 22, label: 'B', text: 'web.xml', correct: true },
      { id: 23, label: 'C', text: 'context.xml', correct: false },
      { id: 24, label: 'D', text: 'pom.xml', correct: false }
    ]
  },
  {
    id: 3,
    moocId: 1,
    type: 'tf',
    stem: 'DoGet dùng để tạo mới (REST).',
    options: [
      { id: 31, label: 'A', text: 'Đúng', correct: false },
      { id: 32, label: 'B', text: 'Sai', correct: true }
    ]
  }
];

export const EXAMS = [
  {
    id: 1,
    moocId: 1,
    name: 'Quiz Servlet Cơ bản',
    duration: 20,
    itemQuestionIds: [1, 2, 3],
    passMark: 60
  }
];

export const BLOGS = [
  { 
    id: 1, 
    title: "Class adds $30 million to its balance sheet for a 'Zoom-friendly' edtech solution", 
    author: 'Lina', 
    views: 251232, 
    readTime: '5 min read',
    category: 'Inspiration',
    slug: 'class-adds-30-million-balance-sheet',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3',
    excerpt: 'TOTC is a platform that allows educators to create online classes whereby they can store the course materials online; manage assignments, quizzes and exams; monitor due dates; grade results and provide students with feedback all in one place.',
    tags: ['affordable', 'Blended', 'marketing', 'implementacoes']
  },
  { 
    id: 2, 
    title: 'Building Modern Web Applications with React and Tailwind', 
    author: 'John Doe', 
    views: 189456, 
    readTime: '7 min read',
    category: 'Development',
    slug: 'building-modern-web-applications',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
    excerpt: 'Learn how to create beautiful, responsive web applications using React and Tailwind CSS with modern development practices.',
    tags: ['React', 'Tailwind', 'Development', 'Frontend']
  },
  {
    id: 3,
    title: 'AWS Certified Solutions Architect Complete Guide',
    author: 'Sarah Chen',
    views: 145823,
    readTime: '12 min read', 
    category: 'Design',
    slug: 'aws-certified-solutions-architect-guide',
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3',
    excerpt: 'Complete preparation guide for AWS Solutions Architect certification with hands-on examples and best practices.',
    tags: ['AWS', 'Cloud', 'Architecture', 'Certification']
  },
  {
    id: 4,
    title: 'UX/UI Design Principles for Modern Applications',
    author: 'Mike Johnson', 
    views: 98745,
    readTime: '8 min read',
    category: 'Design',
    slug: 'ux-ui-design-principles',
    image: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3',
    excerpt: 'Essential design principles and best practices for creating intuitive and engaging user experiences.',
    tags: ['UX', 'UI', 'Design', 'User Experience']
  },
  {
    id: 5,
    title: 'JavaScript ES6+ Features Every Developer Should Know',
    author: 'Alex Rodriguez',
    views: 203456,
    readTime: '10 min read',
    category: 'Development',
    slug: 'javascript-es6-features',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3',
    excerpt: 'Master the essential ES6+ features that will make you a more productive JavaScript developer.',
    tags: ['JavaScript', 'ES6', 'Programming', 'Frontend']
  },
  {
    id: 6,
    title: 'PHP 8 New Features and Performance Improvements',
    author: 'David Wilson',
    views: 156789,
    readTime: '6 min read',
    category: 'Development', 
    slug: 'php-8-new-features',
    image: 'https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3',
    excerpt: 'Explore the latest PHP 8 features and how they can improve your application performance and developer experience.',
    tags: ['PHP', 'Backend', 'Performance', 'Development']
  }
];