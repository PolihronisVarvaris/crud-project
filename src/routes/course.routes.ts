import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { CourseService }    from '../services/course.service';
import { CourseRepository } from '../repositories/course.repository';
import { pool }             from '../config/database';
import { validate }         from '../middleware/validate.middleware';
import {
  createCourseRules,
  updateCourseRules,
  paginationRules,
} from '../validators/course.validator';

const router = Router();

// Dependency injection
const repository = new CourseRepository(pool);
const service    = new CourseService(repository);
const controller = new CourseController(service);

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Retrieve a paginated list of courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of courses
 */
router.get('/',    validate(paginationRules),    controller.getAll);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Course object
 *       404:
 *         description: Course not found
 */
router.get('/:id',                               controller.getById);

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseDto'
 *     responses:
 *       201:
 *         description: Course created
 *       400:
 *         description: Validation error
 */
router.post('/',   validate(createCourseRules),  controller.create);

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Updated course
 *       404:
 *         description: Course not found
 */
router.put('/:id', validate(updateCourseRules),  controller.update);

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Soft delete a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Course not found
 */
router.delete('/:id',                            controller.delete);

export default router;
