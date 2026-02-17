import { body, query, ValidationChain } from 'express-validator';
import { COURSE_STATUSES } from '../models/course.model';

export const createCourseRules: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must be at most 255 characters'),

  body('description')
    .optional()
    .trim()
    .isString().withMessage('Description must be a string'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(COURSE_STATUSES).withMessage(`Status must be one of: ${COURSE_STATUSES.join(', ')}`),

  body('is_premium')
    .notEmpty().withMessage('is_premium is required')
    .isBoolean().withMessage('is_premium must be a boolean'),
];

export const updateCourseRules: ValidationChain[] = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 255 }).withMessage('Title must be at most 255 characters'),

  body('description')
    .optional()
    .trim()
    .isString().withMessage('Description must be a string'),

  body('status')
    .optional()
    .isIn(COURSE_STATUSES).withMessage(`Status must be one of: ${COURSE_STATUSES.join(', ')}`),

  body('is_premium')
    .optional()
    .isBoolean().withMessage('is_premium must be a boolean'),
];

export const paginationRules: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
];
