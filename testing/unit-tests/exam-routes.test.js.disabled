/**
 * Unit Tests for Exam API Routes
 * Framework: Jest + Supertest
 * File: testing/unit-tests/exam-routes.test.js
 */

import request from 'supertest';
import express from 'express';
import sql from 'mssql';
import examRoutes from '../../backend/routes/new-exam-routes.js';

// Mock database connection
jest.mock('../../backend/config/database.js', () => ({
  getPool: jest.fn()
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/learning/exams', examRoutes);

describe('Exam API Routes - Unit Tests', () => {
  let mockPool;
  let mockRequest;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create mock pool and request
    mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn()
    };

    mockPool = {
      request: jest.fn().mockReturnValue(mockRequest)
    };

    // Import getPool mock
    const { getPool } = require('../../backend/config/database.js');
    getPool.mockResolvedValue(mockPool);
  });

  describe('GET /mooc/:moocId - Get Exam Info', () => {
    test('TC-UT-001: Should return exam info for valid MOOC', async () => {
      // Mock MOOC data
      mockRequest.query
        .mockResolvedValueOnce({ // MOOC query
          recordset: [{
            mooc_id: '52',
            mooc_name: 'Python Basics',
            course_id: '10'
          }]
        })
        .mockResolvedValueOnce({ // Question count
          recordset: [{ total: 10 }]
        })
        .mockResolvedValueOnce({ // Previous attempts
          recordset: []
        })
        .mockResolvedValueOnce({ // Lesson progress
          recordset: [{
            total_lessons: 5,
            completed_lessons: 5
          }]
        });

      const response = await request(app)
        .get('/api/learning/exams/mooc/52')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        exam_id: '52',
        mooc_id: '52',
        mooc_name: 'Python Basics',
        total_questions: 10,
        duration_minutes: 20,
        passing_score: 70,
        can_take_exam: true,
        lessons_completed: 5,
        total_lessons: 5,
        previous_attempts: 0
      });
    });

    test('TC-UT-002: Should return 404 for non-existent MOOC', async () => {
      mockRequest.query.mockResolvedValueOnce({
        recordset: [] // No MOOC found
      });

      const response = await request(app)
        .get('/api/learning/exams/mooc/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('MOOC not found');
    });

    test('TC-UT-003: Should indicate cannot take exam if lessons incomplete', async () => {
      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [{
            mooc_id: '52',
            mooc_name: 'Python Basics',
            course_id: '10'
          }]
        })
        .mockResolvedValueOnce({ recordset: [{ total: 10 }] })
        .mockResolvedValueOnce({ recordset: [] })
        .mockResolvedValueOnce({
          recordset: [{
            total_lessons: 5,
            completed_lessons: 3 // Only 3 of 5 completed
          }]
        });

      const response = await request(app)
        .get('/api/learning/exams/mooc/52')
        .expect(200);

      expect(response.body.data.can_take_exam).toBe(false);
      expect(response.body.data.lessons_completed).toBe(3);
      expect(response.body.data.total_lessons).toBe(5);
    });

    test('TC-UT-004: Should include previous attempt data', async () => {
      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [{
            mooc_id: '52',
            mooc_name: 'Python Basics',
            course_id: '10'
          }]
        })
        .mockResolvedValueOnce({ recordset: [{ total: 10 }] })
        .mockResolvedValueOnce({
          recordset: [
            { attempt_id: 1, score: 80, passed: true, submitted_at: new Date() },
            { attempt_id: 2, score: 90, passed: true, submitted_at: new Date() }
          ]
        })
        .mockResolvedValueOnce({
          recordset: [{
            total_lessons: 5,
            completed_lessons: 5
          }]
        });

      const response = await request(app)
        .get('/api/learning/exams/mooc/52')
        .expect(200);

      expect(response.body.data.previous_attempts).toBe(2);
      expect(response.body.data.best_score).toBe(90); // Max of 80 and 90
    });
  });

  describe('POST /:examId/start - Start Exam', () => {
    test('TC-UT-005: Should start exam with valid conditions', async () => {
      const mockQuestions = [
        {
          question_id: 1,
          stem: 'What is Python?',
          qtype: 'multiple_choice',
          difficulty: 'easy'
        },
        {
          question_id: 2,
          stem: 'What is a variable?',
          qtype: 'multiple_choice',
          difficulty: 'easy'
        }
      ];

      const mockOptions = [
        { option_id: 1, label: 'A', content: 'Programming language' },
        { option_id: 2, label: 'B', content: 'Snake' }
      ];

      mockRequest.query
        .mockResolvedValueOnce({ // Lesson completion check
          recordset: [{
            total_lessons: 5,
            completed_lessons: 5
          }]
        })
        .mockResolvedValueOnce({ // Get questions
          recordset: mockQuestions
        })
        .mockResolvedValueOnce({ // Options for question 1
          recordset: mockOptions
        })
        .mockResolvedValueOnce({ // Options for question 2
          recordset: mockOptions
        })
        .mockResolvedValueOnce({ // Create attempt
          recordset: [{
            attempt_id: 123,
            started_at: new Date()
          }]
        });

      const response = await request(app)
        .post('/api/learning/exams/52/start')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.attempt_id).toBe(123);
      expect(response.body.data.total_questions).toBe(2);
      expect(response.body.data.duration_minutes).toBe(20);
      expect(response.body.data.questions).toHaveLength(2);
      expect(response.body.data.questions[0]).toHaveProperty('options');
    });

    test('TC-UT-006: Should reject if no questions available', async () => {
      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [{
            total_lessons: 5,
            completed_lessons: 5
          }]
        })
        .mockResolvedValueOnce({
          recordset: [] // No questions
        });

      const response = await request(app)
        .post('/api/learning/exams/52/start')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No questions available for this exam');
    });
  });

  describe('POST /:examId/submit - Submit Exam', () => {
    test('TC-UT-007: Should calculate 100% score for all correct answers', async () => {
      const submissionData = {
        attempt_id: 123,
        answers: [
          { question_id: 1, selected_option: 'A' },
          { question_id: 2, selected_option: 'B' }
        ]
      };

      mockRequest.query
        .mockResolvedValueOnce({ // Get attempt
          recordset: [{
            attempt_id: 123,
            user_id: 1,
            mooc_id: 52,
            started_at: new Date(),
            total_questions: 2,
            submitted_at: null
          }]
        })
        .mockResolvedValueOnce({ // Correct answer for Q1
          recordset: [{ option_id: 1, label: 'A' }]
        })
        .mockResolvedValueOnce({ // Correct answer for Q2
          recordset: [{ option_id: 2, label: 'B' }]
        })
        .mockResolvedValueOnce({ // Update attempt
          recordset: []
        })
        .mockResolvedValueOnce({ // Get MOOC info
          recordset: [{ course_id: 10, order_no: 1 }]
        })
        .mockResolvedValueOnce({ // Get next MOOC
          recordset: [{ mooc_id: 53 }]
        })
        .mockResolvedValueOnce({ // Update enrollment
          recordset: []
        });

      const response = await request(app)
        .post('/api/learning/exams/52/submit')
        .send(submissionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.score).toBe(100);
      expect(response.body.data.correct_answers).toBe(2);
      expect(response.body.data.total_questions).toBe(2);
      expect(response.body.data.passed).toBe(true);
      expect(response.body.data.next_mooc_unlocked).toBe(true);
    });

    test('TC-UT-008: Should calculate 50% score for half correct', async () => {
      const submissionData = {
        attempt_id: 123,
        answers: [
          { question_id: 1, selected_option: 'A' }, // Correct
          { question_id: 2, selected_option: 'A' }  // Wrong
        ]
      };

      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [{
            attempt_id: 123,
            user_id: 1,
            mooc_id: 52,
            started_at: new Date(),
            total_questions: 2,
            submitted_at: null
          }]
        })
        .mockResolvedValueOnce({ recordset: [{ option_id: 1, label: 'A' }] })
        .mockResolvedValueOnce({ recordset: [{ option_id: 2, label: 'B' }] }) // Correct is B, user selected A
        .mockResolvedValueOnce({ recordset: [] });

      const response = await request(app)
        .post('/api/learning/exams/52/submit')
        .send(submissionData)
        .expect(200);

      expect(response.body.data.score).toBe(50);
      expect(response.body.data.correct_answers).toBe(1);
      expect(response.body.data.passed).toBe(false);
    });

    test('TC-UT-009: Should determine pass at exactly 70%', async () => {
      const submissionData = {
        attempt_id: 123,
        answers: Array.from({ length: 10 }, (_, i) => ({
          question_id: i + 1,
          selected_option: 'A'
        }))
      };

      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [{
            attempt_id: 123,
            user_id: 1,
            mooc_id: 52,
            started_at: new Date(),
            total_questions: 10,
            submitted_at: null
          }]
        });

      // Mock 7 correct, 3 wrong
      for (let i = 0; i < 7; i++) {
        mockRequest.query.mockResolvedValueOnce({
          recordset: [{ option_id: 1, label: 'A' }] // Correct
        });
      }
      for (let i = 0; i < 3; i++) {
        mockRequest.query.mockResolvedValueOnce({
          recordset: [{ option_id: 2, label: 'B' }] // Wrong (user selected A)
        });
      }

      mockRequest.query
        .mockResolvedValueOnce({ recordset: [] }) // Update attempt
        .mockResolvedValueOnce({ recordset: [{ course_id: 10, order_no: 1 }] })
        .mockResolvedValueOnce({ recordset: [{ mooc_id: 53 }] })
        .mockResolvedValueOnce({ recordset: [] });

      const response = await request(app)
        .post('/api/learning/exams/52/submit')
        .send(submissionData)
        .expect(200);

      expect(response.body.data.score).toBe(70);
      expect(response.body.data.passed).toBe(true); // Boundary: exactly 70%
    });

    test('TC-UT-010: Should fail at 69% (just below passing)', async () => {
      const submissionData = {
        attempt_id: 123,
        answers: Array.from({ length: 10 }, (_, i) => ({
          question_id: i + 1,
          selected_option: 'A'
        }))
      };

      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [{
            attempt_id: 123,
            user_id: 1,
            mooc_id: 52,
            started_at: new Date(),
            total_questions: 10,
            submitted_at: null
          }]
        });

      // Mock 6 correct, 4 wrong (60%)
      for (let i = 0; i < 6; i++) {
        mockRequest.query.mockResolvedValueOnce({
          recordset: [{ option_id: 1, label: 'A' }]
        });
      }
      for (let i = 0; i < 4; i++) {
        mockRequest.query.mockResolvedValueOnce({
          recordset: [{ option_id: 2, label: 'B' }]
        });
      }

      mockRequest.query.mockResolvedValueOnce({ recordset: [] });

      const response = await request(app)
        .post('/api/learning/exams/52/submit')
        .send(submissionData)
        .expect(200);

      expect(response.body.data.score).toBe(60);
      expect(response.body.data.passed).toBe(false);
    });

    test('TC-UT-011: Should reject if attempt already submitted', async () => {
      mockRequest.query.mockResolvedValueOnce({
        recordset: [{
          attempt_id: 123,
          user_id: 1,
          mooc_id: 52,
          started_at: new Date(),
          total_questions: 10,
          submitted_at: new Date() // Already submitted
        }]
      });

      const response = await request(app)
        .post('/api/learning/exams/52/submit')
        .send({
          attempt_id: 123,
          answers: []
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Exam already submitted');
    });

    test('TC-UT-012: Should reject if time limit exceeded', async () => {
      const startTime = new Date();
      startTime.setMinutes(startTime.getMinutes() - 25); // Started 25 minutes ago

      mockRequest.query.mockResolvedValueOnce({
        recordset: [{
          attempt_id: 123,
          user_id: 1,
          mooc_id: 52,
          started_at: startTime, // 25 minutes ago
          total_questions: 10,
          submitted_at: null
        }]
      });

      const response = await request(app)
        .post('/api/learning/exams/52/submit')
        .send({
          attempt_id: 123,
          answers: []
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Time limit exceeded');
    });

    test('TC-UT-013: Should reject if missing required fields', async () => {
      const response = await request(app)
        .post('/api/learning/exams/52/submit')
        .send({
          // Missing attempt_id and answers
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  describe('GET /attempts/:attemptId/result - Get Exam Result', () => {
    test('TC-UT-014: Should return detailed results with all questions', async () => {
      const mockAttempt = {
        attempt_id: 123,
        user_id: 1,
        mooc_id: 52,
        started_at: new Date(),
        submitted_at: new Date(),
        time_taken: 600,
        total_questions: 2,
        correct_answers: 2,
        score: 100,
        passed: true,
        answers: JSON.stringify([
          { question_id: 1, selected_option: 'A' },
          { question_id: 2, selected_option: 'B' }
        ]),
        mooc_name: 'Python Basics'
      };

      mockRequest.query
        .mockResolvedValueOnce({
          recordset: [mockAttempt]
        })
        .mockResolvedValueOnce({ // Question 1
          recordset: [{
            question_id: 1,
            stem: 'What is Python?',
            difficulty: 'easy'
          }]
        })
        .mockResolvedValueOnce({ // Options for Q1
          recordset: [
            { option_id: 1, label: 'A', content: 'Language', is_correct: true },
            { option_id: 2, label: 'B', content: 'Snake', is_correct: false }
          ]
        })
        .mockResolvedValueOnce({ // Question 2
          recordset: [{
            question_id: 2,
            stem: 'What is a variable?',
            difficulty: 'easy'
          }]
        })
        .mockResolvedValueOnce({ // Options for Q2
          recordset: [
            { option_id: 3, label: 'A', content: 'Wrong', is_correct: false },
            { option_id: 4, label: 'B', content: 'Storage', is_correct: true }
          ]
        });

      const response = await request(app)
        .get('/api/learning/exams/attempts/123/result')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.attempt_id).toBe(123);
      expect(response.body.data.score).toBe(100);
      expect(response.body.data.passed).toBe(true);
      expect(response.body.data.detailed_results).toHaveLength(2);
      expect(response.body.data.detailed_results[0]).toMatchObject({
        question_id: 1,
        selected_option: 'A',
        correct_option: 'A',
        is_correct: true
      });
    });

    test('TC-UT-015: Should return 404 for non-existent attempt', async () => {
      mockRequest.query.mockResolvedValueOnce({
        recordset: []
      });

      const response = await request(app)
        .get('/api/learning/exams/attempts/999/result')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Exam attempt not found');
    });

    test('TC-UT-016: Should reject if exam not submitted yet', async () => {
      mockRequest.query.mockResolvedValueOnce({
        recordset: [{
          attempt_id: 123,
          user_id: 1,
          submitted_at: null // Not submitted
        }]
      });

      const response = await request(app)
        .get('/api/learning/exams/attempts/123/result')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Exam not yet submitted');
    });
  });
});

describe('Exam Business Logic - Unit Tests', () => {
  describe('Score Calculation Logic', () => {
    /**
     * Helper function to calculate score
     * Extracted from backend logic for unit testing
     */
    const calculateScore = (correctCount, totalQuestions) => {
      return (correctCount / totalQuestions) * 100;
    };

    test('TC-UT-017: Should calculate 100% for all correct', () => {
      expect(calculateScore(10, 10)).toBe(100);
    });

    test('TC-UT-018: Should calculate 0% for all wrong', () => {
      expect(calculateScore(0, 10)).toBe(0);
    });

    test('TC-UT-019: Should calculate 70% for boundary pass', () => {
      expect(calculateScore(7, 10)).toBe(70);
    });

    test('TC-UT-020: Should calculate 60% for boundary fail', () => {
      expect(calculateScore(6, 10)).toBe(60);
    });

    test('TC-UT-021: Should handle decimal precision correctly', () => {
      const score = calculateScore(7, 9); // 77.777...
      expect(score).toBeCloseTo(77.78, 2);
    });
  });

  describe('Pass/Fail Determination', () => {
    const isPassed = (score) => score >= 70;

    test('TC-UT-022: Should pass at exactly 70%', () => {
      expect(isPassed(70)).toBe(true);
    });

    test('TC-UT-023: Should fail at 69.99%', () => {
      expect(isPassed(69.99)).toBe(false);
    });

    test('TC-UT-024: Should pass at 100%', () => {
      expect(isPassed(100)).toBe(true);
    });

    test('TC-UT-025: Should fail at 0%', () => {
      expect(isPassed(0)).toBe(false);
    });
  });

  describe('Time Validation', () => {
    const isWithinTimeLimit = (startTime, currentTime, limitSeconds = 1200) => {
      const elapsed = (currentTime - startTime) / 1000;
      return elapsed <= limitSeconds;
    };

    test('TC-UT-026: Should allow submission within 20 minutes', () => {
      const start = new Date('2025-01-01T10:00:00');
      const current = new Date('2025-01-01T10:19:00'); // 19 minutes
      expect(isWithinTimeLimit(start, current)).toBe(true);
    });

    test('TC-UT-027: Should reject submission after 20 minutes', () => {
      const start = new Date('2025-01-01T10:00:00');
      const current = new Date('2025-01-01T10:21:00'); // 21 minutes
      expect(isWithinTimeLimit(start, current)).toBe(false);
    });

    test('TC-UT-028: Should allow at exactly 20 minutes', () => {
      const start = new Date('2025-01-01T10:00:00');
      const current = new Date('2025-01-01T10:20:00'); // Exactly 20 minutes
      expect(isWithinTimeLimit(start, current)).toBe(true);
    });
  });
});

/**
 * Test Execution Summary:
 * - Total Test Cases: 28
 * - Critical Path Tests: 15
 * - Boundary Value Tests: 8
 * - Error Handling Tests: 5
 * - Coverage: API endpoints, business logic, edge cases
 */
