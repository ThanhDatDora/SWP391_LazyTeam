const express = require('express');
const router = express.Router();
const examController = require('../controllers/exam-controller');
const authMiddleware = require('../middleware/auth');

// All exam routes require authentication
router.use(authMiddleware);

/**
 * Get exam info by MOOC ID
 * GET /api/exams/mooc/:moocId
 */
router.get('/mooc/:moocId', examController.getExamByMooc);

/**
 * Start exam - Get random questions
 * POST /api/exams/:examId/start
 */
router.post('/:examId/start', examController.startExam);

/**
 * Submit exam and calculate score
 * POST /api/exams/:examId/submit
 */
router.post('/:examId/submit', examController.submitExam);

/**
 * Get exam result with detailed answers
 * GET /api/exams/attempts/:attemptId/result
 */
router.get('/attempts/:attemptId/result', examController.getExamResult);

/**
 * Get course progress with all MOOCs and exams
 * GET /api/learning/course/:courseId/progress
 */
router.get('/learning/course/:courseId/progress', examController.getCourseProgress);

module.exports = router;
