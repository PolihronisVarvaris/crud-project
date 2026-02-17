import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'Course CRUD API',
      version:     '1.0.0',
      description: 'RESTful CRUD API for managing courses',
    },
    servers: [{ url: '/api/v1', description: 'Development server' }],
    components: {
      schemas: {
        CourseStatus: {
          type: 'string',
          enum: ['Published', 'Pending'],
        },
        CreateCourseDto: {
          type: 'object',
          required: ['title', 'status', 'is_premium'],
          properties: {
            title:       { type: 'string', maxLength: 255, example: 'Introduction to TypeScript' },
            description: { type: 'string', nullable: true, example: 'Learn TypeScript from scratch' },
            status:      { $ref: '#/components/schemas/CourseStatus' },
            is_premium:  { type: 'boolean', example: false },
          },
        },
        UpdateCourseDto: {
          type: 'object',
          properties: {
            title:       { type: 'string', maxLength: 255 },
            description: { type: 'string', nullable: true },
            status:      { $ref: '#/components/schemas/CourseStatus' },
            is_premium:  { type: 'boolean' },
          },
        },
        CourseResponse: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            title:       { type: 'string' },
            description: { type: 'string', nullable: true },
            status:      { $ref: '#/components/schemas/CourseStatus' },
            is_premium:  { type: 'boolean' },
            created_at:  { type: 'string', format: 'date-time' },
            updated_at:  { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code:    { type: 'string' },
                message: { type: 'string' },
                details: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
