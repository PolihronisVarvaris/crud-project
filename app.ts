import express from 'express';
import cors    from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec }     from './src/docs/swagger';
import courseRoutes        from './src/routes/course.routes';
import { errorMiddleware } from './src/middleware/error.middleware';

const app = express();

// ── Global middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── API docs ─────────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1/courses', courseRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Error handler (must be last) ─────────────────────────────────────────────
app.use(errorMiddleware);

export default app;
