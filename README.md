# Mini Coursera - Online Learning Platform

## 📖 Overview

Mini Coursera là một nền tảng học trực tuyến được xây dựng với React và TailwindCSS, cung cấp trải nghiệm học tập hiện đại và tương tác. Dự án bao gồm frontend React và backend Node.js/Express với SQL Server database.

## ✨ Features

### 🎓 Course Management
- **Course Catalog**: Duyệt và tìm kiếm khóa học theo danh mục
- **Course Creation**: Giảng viên có thể tạo và quản lý khóa học
- **Content Management**: Quản lý bài học, video, tài liệu
- **Progress Tracking**: Theo dõi tiến độ học tập của học viên

### 👥 User Management
- **Multi-role System**: Admin, Instructor, Learner
- **Authentication**: Đăng ký, đăng nhập với JWT
- **Profile Management**: Quản lý thông tin cá nhân
- **Authorization**: Phân quyền truy cập theo vai trò

### 📊 Assessment System
- **Online Exams**: Tạo và thực hiện bài thi trực tuyến
- **Question Management**: Quản lý ngân hàng câu hỏi
- **Automatic Grading**: Chấm điểm tự động
- **Exam History**: Lịch sử bài thi và kết quả

### 🎨 Modern UI/UX
- **Responsive Design**: Tối ưu cho mọi thiết bị
- **TailwindCSS**: Thiết kế hiện đại và nhất quán
- **Interactive Components**: Giao diện tương tác mượt mà
- **Accessibility**: Hỗ trợ accessibility standards

## 🛠 Tech Stack

### Frontend
- **React 18.2.0**: UI Framework
- **React Router DOM**: Client-side routing
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Vite**: Build tool và development server

### Backend
- **Node.js**: Runtime environment (ESM modules)
- **Express.js**: Web framework
- **SQL Server**: Database with connection pooling
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **mssql**: SQL Server driver
- **Redis + NodeCache**: Caching system (hybrid approach)
- **Socket.io**: WebSocket support

## 🔧 Recent Updates & Improvements

### Module System Migration (October 2025)
✅ **Completed migration from CommonJS to ESM modules**
- Converted all backend services to ES modules (import/export)
- Fixed database connection pool access patterns
- Updated all middleware and route handlers
- Enhanced caching service with Redis + in-memory fallback
- Improved query optimizer with connection pooling

### Key Technical Improvements:
- **Database Connection**: Fixed connection pool access in `queryOptimizer.js`
- **Cache System**: Hybrid Redis + NodeCache for better reliability
- **Module Consistency**: All backend code now uses ESM imports
- **Performance**: Enhanced query optimization and caching strategies
- **Error Handling**: Improved async error handling patterns

### Development Tools
- **Concurrently**: Run multiple npm scripts
- **ESLint**: Code quality
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes

## 📁 Project Structure

```
mini-coursera-ui-tailwind/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── course/         # Course-related components
│   │   ├── layout/         # Layout components (Header, Footer, etc.)
│   │   └── ui/            # Base UI components (Button, Card, etc.)
│   ├── pages/              # Page components
│   │   ├── admin/         # Admin panel pages
│   │   ├── auth/          # Authentication pages
│   │   ├── course/        # Course-related pages
│   │   ├── exam/          # Exam pages
│   │   └── instructor/    # Instructor dashboard
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   └── router/            # Routing configuration
├── backend/               # Backend API server
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── config/           # Backend configuration
│   └── database/         # Database setup
├── scripts/              # Build and utility scripts
└── public/               # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- SQL Server database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mini-coursera-ui-tailwind
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment variables template
   cp .env.example .env.local
   
   # Edit .env.local with your configuration
   ```

4. **Database Setup**
   - Tạo SQL Server database theo hướng dẫn trong `DATABASE_SETUP.md`
   - Update connection string trong `.env.local`

5. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start separately
   npm run dev:backend  # Backend only
   npm run dev          # Frontend only
   ```

## 📊 Available Scripts

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check-quality` - Run code quality checks
- `npm run fix:navigation` - Fix navigation patterns
- `npm run analyze` - Run quality check and build

### Backend Scripts
- `npm run dev:backend` - Start backend development server
- `npm run dev:full` - Start both frontend and backend

## 🔧 Configuration

### Environment Variables

Create `.env.local` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Feature Flags
VITE_ENABLE_ADMIN=true
VITE_ENABLE_PAYMENT=false
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_CHAT=false

# Database (for backend)
DB_SERVER=localhost
DB_NAME=MiniCourseraFPTU1
DB_USER=your_username
DB_PASSWORD=your_password
DB_PORT=1433

# JWT Secret (for backend)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
```

### Database Configuration

Tham khảo file `DATABASE_SETUP.md` để setup database SQL Server.

## 🏗 Architecture

### Frontend Architecture
- **Component-based**: Sử dụng React functional components với hooks
- **Context API**: Quản lý global state (Authentication, Theme)
- **Custom Hooks**: Logic tái sử dụng (useNavigation, useAsyncState, useDataFetching)
- **Service Layer**: API calls được tách riêng trong services/
- **Utility Functions**: Helper functions cho formatting, validation, storage

### Backend Architecture
- **RESTful API**: Thiết kế API theo chuẩn REST
- **Middleware**: Authentication, error handling, logging
- **Database Layer**: SQL Server với stored procedures
- **JWT Authentication**: Stateless authentication với refresh tokens
- **Error Handling**: Centralized error handling và logging

### Key Features Implementation

#### Authentication System
```javascript
// Frontend - AuthContext
const AuthContext = createContext();

// Backend - JWT middleware
const authenticateToken = (req, res, next) => {
  // Verify JWT token
};
```

#### Navigation Management
```javascript
// Custom hook for navigation
const useNavigation = () => {
  const navigate = useNavigate();
  return {
    goHome: () => navigate('/'),
    goAuth: () => navigate('/auth'),
    goCourse: (id) => navigate(`/course/${id}`)
  };
};
```

#### API Service
```javascript
// Centralized API service with error handling
class ApiService {
  async getCourses(params) {
    return await httpClient.get('/courses', params);
  }
}
```

## 🧪 Testing

### Test Infrastructure
Dự án sử dụng **Jest** với **React Testing Library** (frontend) và **Supertest** (backend) để đảm bảo code quality và reliability.

**Test Coverage:**
- 🛒 **CartContext**: 18 test cases (95% coverage)
- 💳 **Checkout API**: 15 test cases (80% coverage)  
- 🔐 **Auth API**: Planned (10+ test cases)
- 📊 **Overall**: 43+ test cases, 85%+ coverage target

**Methodology:**
- Áp dụng **AI4SE methodology** (6 phases: Analyze, Design, Code, Debug, Optimize, Demo)
- Given-When-Then test case pattern
- Test Matrix organization
- AI-assisted test generation

### Installation

Install testing dependencies:

```bash
# Frontend testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @babel/preset-react identity-obj-proxy babel-jest

# Backend testing dependencies
cd backend
npm install --save-dev jest supertest @babel/preset-env babel-jest
```

### Running Tests

```bash
# Frontend tests
npm run test:jest              # Run all frontend tests
npm run test:jest:watch        # Watch mode for development
npm run test:jest:coverage     # Generate coverage report

# Backend tests
cd backend
npm test                       # Run all backend tests
npm test -- --watch            # Watch mode
npm test -- --coverage         # Generate coverage report

# Run all tests (frontend + backend)
npm run test:all
```

### Viewing Coverage Reports

After running tests with `--coverage`, open the HTML reports:

```bash
# Frontend coverage
open coverage/lcov-report/index.html

# Backend coverage  
open backend/coverage/lcov-report/index.html
```

**Coverage Thresholds:**
- Frontend: 70% (branches, functions, lines, statements)
- Backend: 60% overall, 90%+ for critical paths
- Critical business logic: 80%+

### Test Structure

**Frontend Tests** (`src/**/__tests__/`):
```javascript
// Example: CartContext.test.jsx
describe('CartContext', () => {
  describe('addToCart()', () => {
    test('should add new course to empty cart', async () => {
      // Arrange: Setup test data
      const course = mockCourse({ id: 1, price: 100000 });
      
      // Act: Execute function
      act(() => cart.addToCart(course));
      
      // Assert: Verify results
      await waitFor(() => {
        expect(cart.cartItems).toHaveLength(1);
        expect(cart.cartItems[0].title).toBe('Test Course');
      });
    });
  });
});
```

**Backend Tests** (`backend/routes/__tests__/`):
```javascript
// Example: checkout.test.js
describe('POST /api/checkout/create-order', () => {
  test('should create order successfully', async () => {
    // Arrange: Mock database responses
    mockRequest.query
      .mockResolvedValueOnce({ recordset: [{ price: 100000 }] });
    
    // Act: Send API request
    const response = await request(app)
      .post('/api/checkout/create-order')
      .send(validOrderData)
      .expect(200);
    
    // Assert: Verify response
    expect(response.body.success).toBe(true);
    expect(response.body.data.paymentId).toBeDefined();
  });
});
```

### Key Test Features

**Mocking Strategies:**
- ✅ **localStorage**: Mocked in `setupTests.js` for cart persistence tests
- ✅ **useToast**: Mocked for notification verification
- ✅ **Database**: Connection pool and transactions mocked for API tests
- ✅ **Authentication**: JWT middleware mocked for protected routes

**Test Types:**
- 🧩 **Unit Tests**: Individual functions (CartContext methods)
- 🔗 **Integration Tests**: API endpoints with database mocks
- ⚠️ **Edge Cases**: Large carts, zero prices, corrupted data
- 🚨 **Error Handling**: Invalid inputs, missing data, rollback scenarios

### Debugging Tests

```bash
# Run single test file
npm test CartContext.test.jsx

# Run tests matching pattern
npm test -- --testNamePattern="addToCart"

# Verbose output
npm test -- --verbose

# Debug with Chrome DevTools
node --inspect-brk node_modules/.bin/jest --runInBand
```

**Common Issues:**
- **Module not found**: Check `moduleNameMapper` in `jest.config.js`
- **localStorage undefined**: Verify `setupTests.js` is loaded
- **Async timeout**: Increase `testTimeout` or fix `waitFor()` conditions
- **Mock not working**: Ensure mocks are cleared in `beforeEach`

### Documentation

📚 **Comprehensive Testing Guides:**
- **[TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md)** - Complete testing strategy, test matrices, setup instructions, best practices
- **[PROMPTS_LOG.md](./PROMPTS_LOG.md)** - AI prompts used for test generation following AI4SE methodology

**What's Included:**
- Test case matrices with Given-When-Then patterns
- AI prompts for analysis, design, and code generation
- Mocking strategies with code examples
- Debugging tips for common issues
- Maintenance checklist and best practices

### CI/CD Integration (Planned)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run test:all
      - run: npm run test:jest:coverage
```

---

## 🧪 Quality Assurance

### Code Quality Tools
- **ESLint**: Code style và best practices
- **Jest**: Unit và integration testing framework
- **React Testing Library**: Component testing utilities
- **Supertest**: HTTP assertion testing for APIs
- **Custom Quality Check**: Script kiểm tra patterns và conventions
- **Navigation Fixer**: Tự động fix navigation patterns

### Code Standards
- **Component Naming**: PascalCase cho React components
- **File Structure**: Organized theo feature và type
- **Import/Export**: Consistent import patterns
- **Error Handling**: Proper error boundaries và async error handling
- **Test Coverage**: Minimum 70% for frontend, 60% for backend
- **Test Naming**: Descriptive "should..." pattern

### Performance Optimization
- **Lazy Loading**: Code splitting cho pages
- **Caching**: API response caching
- **Image Optimization**: Responsive images với WebP
- **Bundle Optimization**: Vite build optimization

## 🚦 Deployment

### Build for Production
```bash
# Frontend build
npm run build

# Backend setup
cd backend
npm install --production
```

### Environment Setup
1. Set production environment variables
2. Configure database connection
3. Set up HTTPS certificates
4. Configure reverse proxy (nginx)

### Docker Deployment (Optional)
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes và commit: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Create Pull Request

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] Tests pass và coverage maintained
- [ ] Documentation updated
- [ ] No console.log trong production code
- [ ] Responsive design tested
- [ ] Accessibility checked

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/register
GET /api/auth/profile
PUT /api/auth/profile
POST /api/auth/logout
```

### Course Endpoints
```
GET /api/courses
GET /api/courses/:id
POST /api/courses
PUT /api/courses/:id
DELETE /api/courses/:id
POST /api/courses/:id/enroll
```

### Exam Endpoints
```
GET /api/exams/:id
POST /api/exams/:id/submit
GET /api/exams/history
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Issues**
```
Error: Login failed for user 'username'
Solution: Check database credentials trong .env file
```

**Module System Issues (After ESM Migration)**
```
Error: Cannot find module '../config/database' 
Error: pool is not defined
Solution: All backend files now use ESM imports. 
- Use: import { getPool } from '../config/database.js'
- Instead of: const { pool } = require('../config/database')
```

**Express Slow Down Warnings**
```
Warning: ExpressSlowDownWarning: The behaviour of the 'delayMs' option...
Solution: These are warnings only - server still works. To fix, update middleware/optimization.js:
- Change delayMs: 100 to delayMs: () => 100
```

**Build Errors**
```
Error: Module not found
Solution: Delete node_modules và chạy npm install
```

**CORS Issues**
```
Error: Access to fetch blocked by CORS policy
Solution: Configure CORS trong backend Express app
```

**Cache Service Issues**
```
Error: Redis connection failed but server continues
Solution: Normal behavior - falls back to in-memory cache automatically
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TailwindCSS Team** - For the amazing CSS framework
- **React Team** - For the powerful UI library
- **Vite Team** - For the fast build tool
- **Lucide** - For the beautiful icon library

## 📞 Support

- **Email**: support@minicoursera.com
- **Documentation**: [Wiki](wiki-url)
- **Issues**: [GitHub Issues](issues-url)

---

**Made with ❤️ by the Mini Coursera Team**
