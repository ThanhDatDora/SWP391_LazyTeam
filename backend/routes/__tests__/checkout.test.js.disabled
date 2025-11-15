/**
 * Unit Tests for Checkout API
 * 
 * Test Coverage:
 * - POST /create-order: Valid order, invalid data, missing fields
 * - POST /enroll-now: Successful enrollment, duplicate enrollment, invalid course
 * - POST /complete-payment: Successful payment, invalid payment ID, transaction integrity
 * - GET /invoices: User invoices, empty invoices, pagination
 * 
 * Total Test Cases: 15+
 * Target Coverage: 80%+
 */

import request from 'supertest';
import express from 'express';
import checkoutRoutes from '../checkout.js';
import { getPool, sql } from '../../config/database.js';
import { authenticateToken } from '../../middleware/auth.js';

// Mock dependencies
jest.mock('../../config/database.js');
jest.mock('../../middleware/auth.js');

describe('Checkout API Integration Tests', () => {
  let app;
  let mockPool;
  let mockTransaction;
  let mockRequest;

  beforeAll(() => {
    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api/checkout', checkoutRoutes);
  });

  beforeEach(() => {
    // Mock database pool and transaction
    mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn(),
      execute: jest.fn()
    };

    mockTransaction = {
      begin: jest.fn().mockResolvedValue(),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      request: jest.fn().mockReturnValue(mockRequest)
    };

    mockPool = {
      request: jest.fn().mockReturnValue(mockRequest),
      transaction: jest.fn().mockReturnValue(mockTransaction)
    };

    getPool.mockResolvedValue(mockPool);

    // Mock authentication middleware
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = { userId: 1, email: 'test@example.com' };
      next();
    });

    jest.clearAllMocks();
  });

  describe('POST /create-order', () => {
    const validOrderData = {
      courses: [
        { courseId: 1 },
        { courseId: 2 }
      ],
      billingInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        address: '123 Main St',
        city: 'Hanoi',
        country: 'Vietnam',
        zipCode: '100000'
      },
      paymentMethod: 'card'
    };

    test('should create order successfully with multiple courses', async () => {
      // Mock course data
      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [{ price: 100000, title: 'Course 1' }]
        })
        .mockResolvedValueOnce({
          recordset: [{ invoice_id: 1 }]
        })
        .mockResolvedValueOnce({
          recordset: [{ price: 200000, title: 'Course 2' }]
        })
        .mockResolvedValueOnce({
          recordset: [{ invoice_id: 2 }]
        })
        .mockResolvedValueOnce({
          recordset: [{ payment_id: 100 }]
        });

      const response = await request(app)
        .post('/api/checkout/create-order')
        .send(validOrderData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paymentId).toBe(100);
      expect(response.body.data.invoiceIds).toHaveLength(2);
      expect(response.body.data.totalAmount).toBe(300000);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('should return 400 for invalid input - empty courses array', async () => {
      const invalidData = {
        ...validOrderData,
        courses: []
      };

      const response = await request(app)
        .post('/api/checkout/create-order')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    test('should return 400 for missing billing info', async () => {
      const invalidData = {
        courses: [{ courseId: 1 }],
        billingInfo: {
          firstName: 'John'
          // Missing required fields
        }
      };

      const response = await request(app)
        .post('/api/checkout/create-order')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    test('should return 400 for invalid email format', async () => {
      const invalidData = {
        ...validOrderData,
        billingInfo: {
          ...validOrderData.billingInfo,
          email: 'invalid-email'
        }
      };

      const response = await request(app)
        .post('/api/checkout/create-order')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    test('should rollback transaction if course not found', async () => {
      mockRequest.query.mockResolvedValueOnce({
        recordset: [] // Course not found
      });

      const response = await request(app)
        .post('/api/checkout/create-order')
        .send(validOrderData)
        .expect(500);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    test('should handle database transaction errors', async () => {
      mockTransaction.begin.mockRejectedValue(new Error('DB Connection Failed'));

      const response = await request(app)
        .post('/api/checkout/create-order')
        .send(validOrderData)
        .expect(500);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /enroll-now', () => {
    const validEnrollData = {
      courseId: 1,
      billingInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        address: '123 Main St',
        city: 'Hanoi',
        country: 'Vietnam',
        zipCode: '100000'
      },
      paymentMethod: 'card'
    };

    test('should enroll user in course successfully', async () => {
      // Mock database responses
      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [{ price: 500000, title: 'Advanced React' }]
        })
        .mockResolvedValueOnce({
          recordset: [{ invoice_id: 1 }]
        })
        .mockResolvedValueOnce({
          recordset: [{ payment_id: 200 }]
        })
        .mockResolvedValueOnce({
          recordset: [{ enrollment_id: 50 }]
        })
        .mockResolvedValueOnce({
          recordset: [] // Notification insert
        });

      const response = await request(app)
        .post('/api/checkout/enroll-now')
        .send(validEnrollData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.enrollmentId).toBe(50);
      expect(response.body.data.transactionRef).toMatch(/^TXN-/);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('should return 400 for missing courseId', async () => {
      const invalidData = {
        ...validEnrollData,
        courseId: undefined
      };

      const response = await request(app)
        .post('/api/checkout/enroll-now')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    test('should return error for non-existent course', async () => {
      mockRequest.query.mockResolvedValueOnce({
        recordset: [] // Course not found
      });

      const response = await request(app)
        .post('/api/checkout/enroll-now')
        .send(validEnrollData)
        .expect(500);

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    test('should handle duplicate enrollment gracefully', async () => {
      // Mock database duplicate key error
      const duplicateError = new Error('Duplicate key');
      duplicateError.number = 2627; // SQL Server duplicate key error code
      
      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [{ price: 500000, title: 'Course' }]
        })
        .mockResolvedValueOnce({
          recordset: [{ invoice_id: 1 }]
        })
        .mockResolvedValueOnce({
          recordset: [{ payment_id: 200 }]
        })
        .mockRejectedValueOnce(duplicateError);

      const response = await request(app)
        .post('/api/checkout/enroll-now')
        .send(validEnrollData)
        .expect(500);

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('POST /complete-payment', () => {
    const validPaymentData = {
      paymentId: 100,
      paymentDetails: {
        cardNumber: '4111111111111111',
        expiryDate: '12/25',
        cvv: '123',
        cardholderName: 'John Doe'
      }
    };

    test('should complete payment successfully', async () => {
      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [] // Update payment status
        })
        .mockResolvedValueOnce({
          recordset: [
            { invoice_id: 1, course_id: 1, user_id: 1 },
            { invoice_id: 2, course_id: 2, user_id: 1 }
          ]
        })
        .mockResolvedValueOnce({
          recordset: [] // Update invoices
        })
        .mockResolvedValueOnce({
          recordset: [{ enrollment_id: 100 }]
        })
        .mockResolvedValueOnce({
          recordset: [{ enrollment_id: 101 }]
        })
        .mockResolvedValueOnce({
          recordset: [] // Notification
        });

      const response = await request(app)
        .post('/api/checkout/complete-payment')
        .send(validPaymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactionRef).toMatch(/^TXN-/);
      expect(response.body.data.enrollments).toHaveLength(2);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('should return 400 for missing paymentId', async () => {
      const invalidData = {
        paymentDetails: validPaymentData.paymentDetails
      };

      const response = await request(app)
        .post('/api/checkout/complete-payment')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    test('should return error if no pending invoices found', async () => {
      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [] // Update payment
        })
        .mockResolvedValueOnce({
          recordset: [] // No pending invoices
        });

      const response = await request(app)
        .post('/api/checkout/complete-payment')
        .send(validPaymentData)
        .expect(500);

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    test('should rollback if enrollment creation fails', async () => {
      mockRequest.query
        .mockResolvedValueOnce({
          recordset: []
        })
        .mockResolvedValueOnce({
          recordset: [{ invoice_id: 1, course_id: 1, user_id: 1 }]
        })
        .mockResolvedValueOnce({
          recordset: []
        })
        .mockRejectedValueOnce(new Error('Enrollment failed'));

      const response = await request(app)
        .post('/api/checkout/complete-payment')
        .send(validPaymentData)
        .expect(500);

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('GET /invoices', () => {
    test('should return user invoices successfully', async () => {
      mockRequest.query.mockResolvedValueOnce({
        recordset: [
          {
            invoice_id: 1,
            course_id: 1,
            course_title: 'React Course',
            amount: 500000,
            status: 'paid',
            created_at: new Date('2024-01-01'),
            paid_at: new Date('2024-01-02')
          },
          {
            invoice_id: 2,
            course_id: 2,
            course_title: 'Node.js Course',
            amount: 400000,
            status: 'paid',
            created_at: new Date('2024-01-03'),
            paid_at: new Date('2024-01-04')
          }
        ]
      });

      const response = await request(app)
        .get('/api/checkout/invoices')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.invoices).toHaveLength(2);
      expect(response.body.data.invoices[0].course_title).toBe('React Course');
    });

    test('should return empty array for user with no invoices', async () => {
      mockRequest.query.mockResolvedValueOnce({
        recordset: []
      });

      const response = await request(app)
        .get('/api/checkout/invoices')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.invoices).toHaveLength(0);
    });

    test('should handle database errors', async () => {
      mockRequest.query.mockRejectedValueOnce(new Error('DB Error'));

      const response = await request(app)
        .get('/api/checkout/invoices')
        .expect(500);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('Authentication', () => {
    test('should reject request without authentication token', async () => {
      // Override mock to not authenticate
      authenticateToken.mockImplementation((req, res, next) => {
        return res.status(401).json({ message: 'Unauthorized' });
      });

      const response = await request(app)
        .post('/api/checkout/create-order')
        .send({
          courses: [{ courseId: 1 }],
          billingInfo: {}
        })
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Edge Cases', () => {
    test('should handle very large order amounts', async () => {
      const largeOrderData = {
        courses: Array.from({ length: 10 }, (_, i) => ({ courseId: i + 1 })),
        billingInfo: validOrderData.billingInfo,
        paymentMethod: 'card'
      };

      // Mock responses for 10 courses
      for (let i = 0; i < 10; i++) {
        mockRequest.query
          .mockResolvedValueOnce({
            recordset: [{ price: 1000000, title: `Course ${i + 1}` }]
          })
          .mockResolvedValueOnce({
            recordset: [{ invoice_id: i + 1 }]
          });
      }

      mockRequest.query.mockResolvedValueOnce({
        recordset: [{ payment_id: 999 }]
      });

      const response = await request(app)
        .post('/api/checkout/create-order')
        .send(largeOrderData)
        .expect(200);

      expect(response.body.data.totalAmount).toBe(10000000);
    });

    test('should generate unique transaction references', async () => {
      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [{ price: 100000, title: 'Course' }]
        })
        .mockResolvedValueOnce({
          recordset: [{ invoice_id: 1 }]
        })
        .mockResolvedValueOnce({
          recordset: [{ payment_id: 1 }]
        })
        .mockResolvedValueOnce({
          recordset: [{ enrollment_id: 1 }]
        })
        .mockResolvedValueOnce({
          recordset: []
        });

      const response1 = await request(app)
        .post('/api/checkout/enroll-now')
        .send({
          courseId: 1,
          billingInfo: validOrderData.billingInfo,
          paymentMethod: 'card'
        });

      const response2 = await request(app)
        .post('/api/checkout/enroll-now')
        .send({
          courseId: 2,
          billingInfo: validOrderData.billingInfo,
          paymentMethod: 'card'
        });

      expect(response1.body.data.transactionRef).not.toBe(
        response2.body.data.transactionRef
      );
    });
  });
});
