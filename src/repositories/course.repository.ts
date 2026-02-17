import { Pool } from 'pg';
import { Course } from '../models/course.model';
import { CreateCourseDto, UpdateCourseDto } from '../dto/course.dto';

export class CourseRepository {
  constructor(private readonly db: Pool) {}

  async findAll(page: number, limit: number): Promise<{ rows: Course[]; total: number }> {
    const offset = (page - 1) * limit;

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) FROM courses WHERE deleted_at IS NULL`
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await this.db.query<Course>(
      `SELECT id, title, description, status, is_premium, created_at, updated_at
       FROM courses
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return { rows: result.rows, total };
  }

  async findById(id: string): Promise<Course | null> {
    const result = await this.db.query<Course>(
      `SELECT id, title, description, status, is_premium, created_at, updated_at
       FROM courses
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async create(dto: CreateCourseDto): Promise<Course> {
    const result = await this.db.query<Course>(
      `INSERT INTO courses (title, description, status, is_premium)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, status, is_premium, created_at, updated_at`,
      [dto.title, dto.description ?? null, dto.status, dto.is_premium]
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateCourseDto): Promise<Course | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (dto.title       !== undefined) { fields.push(`title = $${idx++}`);       values.push(dto.title); }
    if (dto.description !== undefined) { fields.push(`description = $${idx++}`); values.push(dto.description); }
    if (dto.status      !== undefined) { fields.push(`status = $${idx++}`);      values.push(dto.status); }
    if (dto.is_premium  !== undefined) { fields.push(`is_premium = $${idx++}`);  values.push(dto.is_premium); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);

    const result = await this.db.query<Course>(
      `UPDATE courses
       SET ${fields.join(', ')}
       WHERE id = $${idx} AND deleted_at IS NULL
       RETURNING id, title, description, status, is_premium, created_at, updated_at`,
      values
    );
    return result.rows[0] ?? null;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.db.query(
      `UPDATE courses SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
}
