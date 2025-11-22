# AI Prompts Log - Unit Testing Journey

> Document tất cả AI prompts được sử dụng trong quá trình tạo unit tests theo phương pháp [AI4SE](https://tamttt14.github.io/AI4SEProject/index.html)

---

## 📋 Table of Contents
1. [Giai đoạn 1: Phân tích Code](#giai-đoạn-1-phân-tích-code)
2. [Giai đoạn 2: Thiết kế Test Cases](#giai-đoạn-2-thiết-kế-test-cases)
3. [Giai đoạn 3: Sinh Test Code](#giai-đoạn-3-sinh-test-code)
4. [Giai đoạn 4: Debug & Fix](#giai-đoạn-4-debug--fix)
5. [Giai đoạn 5: Tối ưu & Mocking](#giai-đoạn-5-tối-ưu--mocking)

---

## Giai đoạn 1: Phân tích Code

### Prompt 1.1: Analyze CartContext

**Input:**
```
Analyze this Shopping Cart Context implementation and identify all functions that need unit testing:

[CODE: src/contexts/CartContext.jsx]

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (course) => { ... };
  const removeFromCart = (courseId) => { ... };
  const clearCart = () => { ... };
  const isInCart = (courseId) => { ... };
  const getTotalPrice = () => { ... };
  const getItemCount = () => { ... };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, isInCart, getTotalPrice, getItemCount }}>
      {children}
    </CartContext.Provider>
  );
};

For each function, identify:
1. Main functionality
2. Input parameters and types
3. Expected return values
4. Potential edge cases
5. Dependencies that need mocking (localStorage, useToast)
```

**AI Output:**
```
Functions to test:

1. addToCart(course)
   - Main: Add course object to cart array
   - Inputs: course (Object with id, title, price, instructorName, etc.)
   - Returns: void (updates state)
   - Edge cases: 
     * Duplicate course (same id)
     * Missing required fields
     * Very large cart (50+ items)
     * Zero or negative price
   - Dependencies: useToast (toast.success, toast.info), localStorage

2. removeFromCart(courseId)
   - Main: Remove course from cart by ID
   - Inputs: courseId (Number)
   - Returns: void
   - Edge cases:
     * Non-existing courseId
     * Removing from empty cart
     * Multiple removals
   - Dependencies: useToast (toast.success), localStorage

3. clearCart()
   - Main: Remove all items and clear localStorage
   - Inputs: none
   - Returns: void
   - Edge cases:
     * Clearing empty cart
     * Large cart (memory)
   - Dependencies: useToast, localStorage

4. isInCart(courseId)
   - Main: Check if course exists in cart
   - Inputs: courseId (Number)
   - Returns: Boolean
   - Edge cases:
     * Empty cart
     * Non-existing ID
     * Null/undefined input
   - Dependencies: none

5. getTotalPrice()
   - Main: Calculate sum of all course prices
   - Inputs: none
   - Returns: Number
   - Edge cases:
     * Empty cart (return 0)
     * Decimal prices
     * Very large numbers
     * Mixed currencies (if applicable)
   - Dependencies: none

6. getItemCount()
   - Main: Return number of items in cart
   - Inputs: none
   - Returns: Number
   - Edge cases:
     * Empty cart (return 0)
     * Large count
   - Dependencies: none

7. useCart() hook
   - Main: Access cart context
   - Returns: Cart context object
   - Edge cases:
     * Used outside CartProvider (should throw error)
   - Dependencies: CartContext

8. localStorage integration
   - Load on mount
   - Save on change
   - Handle corrupted data
```

---

### Prompt 1.2: Analyze Checkout API

**Input:**
```
Analyze these Express.js checkout API routes and identify testing requirements:

[CODE: backend/routes/checkout.js]

// POST /create-order
router.post('/create-order', authenticateToken, [
  body('courses').isArray().notEmpty(),
  body('billingInfo').isObject(),
  ...
], async (req, res) => {
  // Creates invoices for multiple courses
  // Creates payment record
  // Uses database transaction
});

// POST /enroll-now
router.post('/enroll-now', authenticateToken, [
  body('courseId').isInt(),
  ...
], async (req, res) => {
  // Single course instant enrollment
  // Creates invoice + payment + enrollment atomically
});

// POST /complete-payment
router.post('/complete-payment', authenticateToken, [
  body('paymentId').isInt(),
  ...
], async (req, res) => {
  // Updates payment status
  // Creates enrollments for all courses
  // Sends notifications
});

// GET /invoices
router.get('/invoices', authenticateToken, async (req, res) => {
  // Returns user's invoice history
});

For each endpoint:
1. Request validation requirements
2. Business logic flow
3. Database transactions
4. Error scenarios
5. Response structure
6. Authentication requirements
```

**AI Output:**
```
Endpoints Analysis:

1. POST /create-order
   - Validation: 
     * courses array (non-empty)
     * billingInfo object (firstName, lastName, email, address, city, country, zipCode)
     * paymentMethod string
   - Flow:
     * Validate input
     * Start transaction
     * For each course: Get price, create invoice
     * Create payment record
     * Commit transaction
   - Error scenarios:
     * Empty courses array
     * Invalid email format
     * Course not found
     * Database transaction failure
   - Response: { success, data: { paymentId, invoiceIds, totalAmount } }
   - Auth: Required (JWT)

2. POST /enroll-now
   - Validation:
     * courseId (integer)
     * billingInfo object
   - Flow:
     * Get course details
     * Create invoice (status: paid)
     * Create payment (status: completed)
     * Create enrollment
     * Create notification
   - Error scenarios:
     * Non-existent course
     * Duplicate enrollment
     * Transaction failure
   - Response: { success, data: { enrollmentId, transactionRef } }
   - Auth: Required

3. POST /complete-payment
   - Validation:
     * paymentId (integer)
     * paymentDetails object
   - Flow:
     * Update payment status to completed
     * Generate transaction reference
     * Get pending invoices
     * Update invoices to paid
     * Create enrollments
     * Send notification
   - Error scenarios:
     * Invalid paymentId
     * No pending invoices
     * Enrollment creation fails
   - Response: { success, data: { transactionRef, enrollments } }
   - Auth: Required

4. GET /invoices
   - Validation: none (uses req.user.userId)
   - Flow:
     * Query user invoices with course details
     * Return invoice list
   - Error scenarios:
     * Database query fails
   - Response: { success, data: { invoices: [] } }
   - Auth: Required

Dependencies to mock:
- getPool() - Database connection pool
- sql - SQL parameter types
- authenticateToken - Auth middleware
- express-validator
```

---

## Giai đoạn 2: Thiết kế Test Cases

### Prompt 2.1: CartContext Test Cases

**Input:**
```
Generate comprehensive unit test cases for CartContext's addToCart() function using Given-When-Then pattern:

function addToCart(course) {
  setCartItems(prevItems => {
    const existingItem = prevItems.find(item => item.id === course.id);
    if (existingItem) {
      toast.info('Khóa học đã có trong giỏ hàng');
      return prevItems;
    }
    toast.success('Đã thêm vào giỏ hàng');
    return [...prevItems, {
      id: course.id,
      title: course.title,
      price: course.price,
      instructor: course.instructorName,
      thumbnail: course.thumbnail,
      level: course.level,
      duration: course.duration
    }];
  });
}

Include:
- Happy path scenarios (new item, multiple items)
- Edge cases (duplicate, large cart, zero price)
- Error scenarios
- localStorage integration
- Toast notification verification

Format as test case matrix with columns:
| Category | Test Case | Given | When | Then | Priority |
```

**AI Output:**
```
Test Cases Matrix for addToCart():

| Category | Test Case | Given | When | Then | Priority |
|----------|-----------|-------|------|------|----------|
| Happy Path | Add new item to empty cart | Empty cart | addToCart(course1) | cartItems.length = 1, toast.success called | HIGH |
| Happy Path | Add multiple different courses | Empty cart | addToCart(c1), addToCart(c2) | cartItems.length = 2 | HIGH |
| Happy Path | Save to localStorage | Empty cart | addToCart(course) | localStorage.setItem called with updated cart | HIGH |
| Duplicate | Prevent duplicate addition | Cart with course1 | addToCart(course1 again) | cartItems.length stays 1, toast.info called | HIGH |
| Edge Case | Add course with zero price | Empty cart | addToCart({price: 0}) | Course added successfully | MEDIUM |
| Edge Case | Add to large cart (50 items) | Cart with 49 items | addToCart(course50) | cartItems.length = 50, no errors | MEDIUM |
| Edge Case | Handle missing optional fields | Empty cart | addToCart({id, title, price only}) | Course added with undefined fields | LOW |
| Integration | localStorage persistence | Empty cart | addToCart(course) | localStorage contains course data | HIGH |
| Integration | Toast notification | Empty cart | addToCart(course) | toast.success('Đã thêm vào giỏ hàng') | HIGH |
| Error | Add course with missing required field | Empty cart | addToCart({id, title}) | Should handle gracefully or throw | MEDIUM |
| Edge Case | Very large price | Empty cart | addToCart({price: 99999999}) | No number overflow | LOW |
| Edge Case | Decimal price | Empty cart | addToCart({price: 99999.99}) | Preserves decimal precision | MEDIUM |
```

---

### Prompt 2.2: Checkout API Test Cases

**Input:**
```
Generate integration test cases for POST /api/checkout/create-order endpoint:

Endpoint: POST /api/checkout/create-order
Authentication: Required (JWT token)

Request Body:
{
  courses: [{ courseId: number }],
  billingInfo: {
    firstName: string,
    lastName: string,
    email: string,
    address: string,
    city: string,
    country: string,
    zipCode: string
  },
  paymentMethod: string ('card' | 'paypal' | 'crypto')
}

Business Logic:
1. Validate input with express-validator
2. Start database transaction
3. For each course:
   - Get course price from database
   - Create invoice (status: pending)
4. Create payment record (status: pending)
5. Commit transaction
6. Return paymentId, invoiceIds, totalAmount

Include test cases for:
- Happy path (1 course, 2 courses, 10 courses)
- Validation errors (empty array, missing fields, invalid email)
- Database errors (course not found, transaction failure)
- Authentication errors (missing token, invalid token)
- Edge cases (large order, very high prices)
- Transaction rollback scenarios

Format: | Category | Test Case | Input | Expected Response | Priority |
```

**AI Output:**
```
Test Cases for POST /create-order:

| Category | Test Case | Input | Expected Response | Priority |
|----------|-----------|-------|-------------------|----------|
| Happy Path | Create order with 1 course | Valid course + billing | 200, { paymentId, invoiceIds: [1], totalAmount } | HIGH |
| Happy Path | Create order with 2 courses | 2 courses + billing | 200, { invoiceIds: [1,2], totalAmount = sum } | HIGH |
| Happy Path | Create order with 10 courses | 10 courses + billing | 200, handles large order correctly | MEDIUM |
| Validation | Empty courses array | courses: [] | 400, validation error | HIGH |
| Validation | Missing billing firstName | Missing firstName | 400, validation error | HIGH |
| Validation | Invalid email format | email: 'not-an-email' | 400, validation error | HIGH |
| Validation | Missing required field (address) | No address | 400, validation error | MEDIUM |
| Database | Course not found | courseId: 9999 | 500, error + transaction rollback | HIGH |
| Database | Transaction begin fails | DB connection error | 500, error message | MEDIUM |
| Database | Transaction commit fails | Commit error | 500, rollback executed | MEDIUM |
| Auth | No authentication token | No Authorization header | 401, Unauthorized | HIGH |
| Auth | Invalid token | Invalid JWT | 401, Unauthorized | HIGH |
| Auth | Expired token | Expired JWT | 401, Token expired | MEDIUM |
| Edge Case | Very large order (50 courses) | 50 courseIds | 200, handles correctly | LOW |
| Edge Case | Very high price (99M VND) | Course price = 99000000 | 200, no overflow | LOW |
| Transaction | Rollback on invoice creation failure | Invoice insert fails | Transaction rolled back, no data saved | HIGH |
| Transaction | Rollback on payment creation failure | Payment insert fails | Transaction rolled back | HIGH |
| Integration | Payment method = paypal | paymentMethod: 'paypal' | 200, payment.provider = 'paypal' | MEDIUM |
| Integration | Payment method = crypto | paymentMethod: 'crypto' | 200, payment.provider = 'crypto' | LOW |
```

---

## Giai đoạn 3: Sinh Test Code

### Prompt 3.1: Generate CartContext Jest Tests

**Input:**
```
Create comprehensive Jest unit tests for CartContext using React Testing Library:

Requirements:
- Framework: Jest + @testing-library/react
- Mock dependencies: useToast, localStorage
- Test all 7 functions: addToCart, removeFromCart, clearCart, isInCart, getTotalPrice, getItemCount, useCart hook
- Include setup/teardown in beforeEach/afterEach
- Use proper assertions (toEqual, toHaveLength, toBe, toMatch)
- Add descriptive test names with 'should...' pattern
- Group tests by describe blocks (Initialization, addToCart, removeFromCart, etc.)
- Use act() for state updates
- Use waitFor() for async assertions
- Test localStorage integration (save/load)
- Test toast notifications
- Include edge cases (large cart, zero price, corrupted data)
- Test error handling (useCart without provider)
- Target coverage: 95%+

File structure:
src/contexts/__tests__/CartContext.test.jsx

Example test structure:
describe('CartContext', () => {
  describe('addToCart()', () => {
    test('should add new course to empty cart', () => {
      // Test implementation
    });
  });
});
```

**AI Output:**
```javascript
// Generated test code for CartContext
// (Full code in src/contexts/__tests__/CartContext.test.jsx)

import { render, act, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';

jest.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    toast: {
      success: jest.fn(),
      info: jest.fn(),
    }
  })
}));

const TestComponent = ({ onRender }) => {
  const cart = useCart();
  React.useEffect(() => {
    if (onRender) onRender(cart);
  });
  return <div>Test</div>;
};

describe('CartContext', () => {
  let cart;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('addToCart()', () => {
    test('should add new course to empty cart', async () => {
      await renderWithCart();
      const course = { id: 1, title: 'Test', price: 100000, instructorName: 'Teacher' };
      
      act(() => {
        cart.addToCart(course);
      });

      await waitFor(() => {
        expect(cart.cartItems).toHaveLength(1);
        expect(cart.cartItems[0].title).toBe('Test');
      });
    });
  });
});
```

---

### Prompt 3.2: Generate Checkout API Tests

**Input:**
```
Create supertest integration tests for Checkout API endpoints:

Requirements:
- Framework: Jest + Supertest
- Mock dependencies: getPool, sql, authenticateToken middleware
- Test all 4 endpoints: /create-order, /enroll-now, /complete-payment, /invoices
- Mock database transactions (begin, commit, rollback)
- Mock request().input().query() chain
- Test HTTP status codes (200, 400, 401, 500)
- Test response structure (success, data, message)
- Test validation errors (express-validator)
- Test transaction rollback scenarios
- Test authentication requirement
- Include edge cases (large orders, unique transaction refs)
- Use descriptive test names
- Group by describe blocks per endpoint
- Target coverage: 80%+

File structure:
backend/routes/__tests__/checkout.test.js

Mock setup example:
const mockRequest = {
  input: jest.fn().mockReturnThis(),
  query: jest.fn()
};

const mockTransaction = {
  begin: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn(),
  request: jest.fn().mockReturnValue(mockRequest)
};

mockPool.transaction.mockReturnValue(mockTransaction);
```

**AI Output:**
```javascript
// Generated test code for Checkout API
// (Full code in backend/routes/__tests__/checkout.test.js)

import request from 'supertest';
import express from 'express';
import checkoutRoutes from '../checkout.js';
import { getPool } from '../../config/database.js';
import { authenticateToken } from '../../middleware/auth.js';

jest.mock('../../config/database.js');
jest.mock('../../middleware/auth.js');

describe('Checkout API', () => {
  let app, mockPool, mockTransaction, mockRequest;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/checkout', checkoutRoutes);

    mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn()
    };

    mockTransaction = {
      begin: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      request: jest.fn().mockReturnValue(mockRequest)
    };

    mockPool = {
      transaction: jest.fn().mockReturnValue(mockTransaction)
    };

    getPool.mockResolvedValue(mockPool);
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { userId: 1 };
      next();
    });
  });

  describe('POST /create-order', () => {
    test('should create order successfully', async () => {
      mockRequest.query
        .mockResolvedValueOnce({ recordset: [{ price: 100000, title: 'Course 1' }] })
        .mockResolvedValueOnce({ recordset: [{ invoice_id: 1 }] })
        .mockResolvedValueOnce({ recordset: [{ payment_id: 100 }] });

      const response = await request(app)
        .post('/api/checkout/create-order')
        .send({ courses: [{ courseId: 1 }], billingInfo: {...} })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
```

---

## Giai đoạn 4: Debug & Fix

### Prompt 4.1: Debug Failing Test

**Input:**
```
Help me fix this failing Jest test:

ERROR:
  TypeError: Cannot read property 'cartItems' of undefined

TEST CODE:
test('should add item to cart', async () => {
  await renderWithCart();
  act(() => {
    cart.addToCart(course);
  });
  expect(cart.cartItems).toHaveLength(1);
});

SOURCE CODE:
const renderWithCart = () => {
  return new Promise((resolve) => {
    render(
      <CartProvider>
        <TestComponent onRender={(cartContext) => {
          cart = cartContext;
          resolve(cartContext);
        }} />
      </CartProvider>
    );
  });
};

What's wrong and how to fix it?
```

**AI Output:**
```
Problem: The `cart` variable is being set asynchronously, but the test is not waiting for the promise to resolve before accessing `cart.cartItems`.

Solution: Use `await` and ensure the cart is assigned before the act() block:

test('should add item to cart', async () => {
  await renderWithCart(); // This now properly waits for cart to be assigned
  
  const course = { id: 1, title: 'Test', price: 100000, instructorName: 'T1' };

  act(() => {
    cart.addToCart(course);
  });

  await waitFor(() => { // Add waitFor for state updates
    expect(cart.cartItems).toHaveLength(1);
  });
});

Alternative: Store the returned cart from renderWithCart:

test('should add item to cart', async () => {
  const cartContext = await renderWithCart();
  
  act(() => {
    cartContext.addToCart(course);
  });

  await waitFor(() => {
    expect(cartContext.cartItems).toHaveLength(1);
  });
});
```

---

### Prompt 4.2: Fix Mock Database Error

**Input:**
```
My Checkout API test is failing with this error:

ERROR: TypeError: mockRequest.query(...).mockResolvedValueOnce is not a function

TEST CODE:
mockRequest.query
  .mockResolvedValueOnce({ recordset: [{ price: 100000 }] })
  .mockResolvedValueOnce({ recordset: [{ invoice_id: 1 }] });

MOCK SETUP:
const mockRequest = {
  input: jest.fn().mockReturnThis(),
  query: jest.fn()
};

How do I properly chain mockResolvedValueOnce for multiple queries?
```

**AI Output:**
```
Problem: The `query` method is not set up to be chainable with mockResolvedValueOnce.

Solution: Set up query as a jest.fn() that can be chained:

const mockRequest = {
  input: jest.fn().mockReturnThis(),
  query: jest.fn() // This creates a mock function
};

// Then in the test, chain mockResolvedValueOnce:
mockRequest.query
  .mockResolvedValueOnce({ recordset: [{ price: 100000, title: 'Course 1' }] })
  .mockResolvedValueOnce({ recordset: [{ invoice_id: 1 }] })
  .mockResolvedValueOnce({ recordset: [{ payment_id: 100 }] });

This works because jest.fn() returns a Jest mock function that supports:
- mockResolvedValueOnce() - for async functions
- mockReturnValueOnce() - for sync functions
- Chaining multiple mocks for sequential calls

Complete working example:
beforeEach(() => {
  mockRequest = {
    input: jest.fn().mockReturnThis(),
    query: jest.fn()
  };

  mockTransaction = {
    begin: jest.fn().mockResolvedValue(),
    commit: jest.fn().mockResolvedValue(),
    rollback: jest.fn().mockResolvedValue(),
    request: jest.fn().mockReturnValue(mockRequest)
  };
});

test('should create order', async () => {
  mockRequest.query
    .mockResolvedValueOnce({ recordset: [{ price: 100000 }] })
    .mockResolvedValueOnce({ recordset: [{ invoice_id: 1 }] });

  const response = await request(app)
    .post('/api/checkout/create-order')
    .send(validData);

  expect(response.status).toBe(200);
});
```

---

## Giai đoạn 5: Tối ưu & Mocking

### Prompt 5.1: Create Mock Data Generator

**Input:**
```
Create a mock data generator utility for tests to avoid repetitive test data creation:

Requirements:
- Generate mock courses with realistic data
- Generate mock billing info
- Generate mock users
- Support customization (override specific fields)
- Type-safe (JSDoc comments)

Example usage:
const course = mockCourse({ id: 1, price: 500000 });
const billingInfo = mockBillingInfo({ email: 'custom@test.com' });
```

**AI Output:**
```javascript
// src/test/__mocks__/mockData.js

/**
 * @typedef {Object} Course
 * @property {number} id
 * @property {string} title
 * @property {number} price
 * @property {string} instructorName
 * @property {string} thumbnail
 * @property {string} level
 * @property {string} duration
 */

/**
 * Generate mock course data
 * @param {Partial<Course>} overrides - Fields to override
 * @returns {Course}
 */
export const mockCourse = (overrides = {}) => ({
  id: 1,
  title: 'Test Course',
  price: 100000,
  instructorName: 'Test Teacher',
  thumbnail: 'https://example.com/image.jpg',
  level: 'Intermediate',
  duration: '10h 30m',
  ...overrides
});

/**
 * Generate mock billing info
 * @param {Object} overrides
 * @returns {Object}
 */
export const mockBillingInfo = (overrides = {}) => ({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  address: '123 Main Street',
  city: 'Hanoi',
  country: 'Vietnam',
  zipCode: '100000',
  ...overrides
});

/**
 * Generate array of mock courses
 * @param {number} count - Number of courses to generate
 * @returns {Course[]}
 */
export const mockCourses = (count = 3) => {
  return Array.from({ length: count }, (_, i) => mockCourse({
    id: i + 1,
    title: `Course ${i + 1}`,
    price: (i + 1) * 100000
  }));
};

/**
 * Generate mock database recordset
 * @param {Array} data - Array of records
 * @returns {Object}
 */
export const mockRecordset = (data) => ({
  recordset: data,
  rowsAffected: [data.length],
  output: {},
  returnValue: 0
});

// Usage in tests:
import { mockCourse, mockBillingInfo, mockCourses } from '../__mocks__/mockData';

test('should add course to cart', () => {
  const course = mockCourse({ id: 5, price: 500000 });
  cart.addToCart(course);
  expect(cart.cartItems).toHaveLength(1);
});

test('should create order with multiple courses', () => {
  const courses = mockCourses(5);
  const billing = mockBillingInfo();
  // Use in test...
});
```

---

### Prompt 5.2: Setup Test Utilities

**Input:**
```
Create test utility functions to reduce boilerplate in tests:

Requirements:
1. renderWithCart() - Render component with CartProvider
2. renderWithAuth() - Render with AuthProvider
3. renderWithAllProviders() - Render with all providers
4. mockLocalStorage() - Setup localStorage mocks
5. waitForCartUpdate() - Wait for cart state updates
6. expectToastCalled() - Assert toast was called with message

These should be reusable across all test files.
```

**AI Output:**
```javascript
// src/test/utils/testUtils.jsx

import React from 'react';
import { render } from '@testing-library/react';
import { CartProvider } from '../../contexts/CartContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { ToastProvider } from '../../contexts/ToastContext';

/**
 * Render component with CartProvider
 */
export const renderWithCart = (ui, options = {}) => {
  return render(
    <ToastProvider>
      <CartProvider>{ui}</CartProvider>
    </ToastProvider>,
    options
  );
};

/**
 * Render component with AuthProvider
 */
export const renderWithAuth = (ui, options = {}) => {
  return render(
    <ToastProvider>
      <AuthProvider>{ui}</AuthProvider>
    </ToastProvider>,
    options
  );
};

/**
 * Render with all providers
 */
export const renderWithAllProviders = (ui, options = {}) => {
  return render(
    <ToastProvider>
      <AuthProvider>
        <CartProvider>{ui}</CartProvider>
      </AuthProvider>
    </ToastProvider>,
    options
  );
};

/**
 * Setup localStorage mocks
 */
export const mockLocalStorage = () => {
  const storage = {};
  
  return {
    getItem: jest.fn((key) => storage[key] || null),
    setItem: jest.fn((key, value) => {
      storage[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    })
  };
};

/**
 * Wait for cart state update
 */
export const waitForCartUpdate = async (cart, expectedLength) => {
  return await waitFor(() => {
    expect(cart.cartItems).toHaveLength(expectedLength);
  }, { timeout: 3000 });
};

/**
 * Assert toast was called with message
 */
export const expectToastCalled = (toastMock, type, message) => {
  expect(toastMock[type]).toHaveBeenCalledWith(
    expect.stringContaining(message)
  );
};

// Usage example:
import { renderWithCart, expectToastCalled } from '../utils/testUtils';

test('should show success toast when adding to cart', () => {
  const { container } = renderWithCart(<MyComponent />);
  // Test logic...
  expectToastCalled(toast, 'success', 'Đã thêm vào giỏ hàng');
});
```

---

## 📊 Summary Statistics

### Prompts Used
- **Analysis Prompts**: 2
- **Test Case Design Prompts**: 2
- **Code Generation Prompts**: 2
- **Debugging Prompts**: 2
- **Optimization Prompts**: 2
- **Total**: **10 prompts**

### Test Coverage Achieved
- **CartContext**: 18 test cases, 95% coverage
- **Checkout API**: 15 test cases, 80% coverage
- **Total**: 33+ test cases, 87% average coverage

### Time Breakdown
- Analysis: 15 minutes
- Test Case Design: 20 minutes
- Code Generation: 75 minutes
- Debugging: 40 minutes
- Optimization: 15 minutes
- Documentation: 15 minutes
- **Total**: **180 minutes** (3 hours)

---

## 🎯 Lessons Learned

### What Worked Well
1. **Structured prompts** với clear requirements giúp AI generate code chất lượng cao
2. **Test case matrix** format giúp visualize coverage gaps
3. **Mock setup** trong beforeEach giúp tests độc lập
4. **Descriptive test names** với "should..." pattern cải thiện readability

### Challenges Faced
1. **Async testing** với React state updates cần `act()` + `waitFor()`
2. **Mock chaining** cho database queries cần setup cẩn thận
3. **Transaction rollback** testing phức tạp hơn happy path
4. **localStorage mocking** cần reset giữa các tests

### Improvements for Future
1. Add **snapshot testing** cho UI components
2. Implement **test data builders** pattern
3. Add **performance benchmarks** cho critical paths
4. Create **visual regression tests** với Percy/Chromatic

---

## 📚 References

- [AI4SE Tutorial](https://tamttt14.github.io/AI4SEProject/index.html)
- [Jest Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

---

**Generated with**: ChatGPT-4, Claude 3.5 Sonnet
**Method**: AI4SE Project Tutorial
**Date**: 2024-01-15
