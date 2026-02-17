import { CourseRepository } from '../repositories/course.repository';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseResponseDto,
  PaginatedResponseDto,
  PaginationQueryDto,
} from '../dto/course.dto';
import { Course } from '../models/course.model';
import { NotFoundException, BusinessRuleException } from '../exceptions/http.exception';

export class CourseService {
  constructor(private readonly repository: CourseRepository) {}

  // ── Helpers ────────────────────────────────────────────────────────────────

  private toResponseDto(course: Course): CourseResponseDto {
    return {
      id:          course.id,
      title:       course.title,
      description: course.description,
      status:      course.status,
      is_premium:  course.is_premium,
      created_at:  course.created_at,
      updated_at:  course.updated_at,
    };
  }

  // ── Public methods ─────────────────────────────────────────────────────────

  async getAll(query: PaginationQueryDto): Promise<PaginatedResponseDto<CourseResponseDto>> {
    const page  = query.page  || 1;
    const limit = query.limit || 20;

    const { rows, total } = await this.repository.findAll(page, limit);

    return {
      data: rows.map(this.toResponseDto.bind(this)),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string): Promise<CourseResponseDto> {
    const course = await this.repository.findById(id);
    if (!course) throw new NotFoundException('Course');
    return this.toResponseDto(course);
  }

  async create(dto: CreateCourseDto): Promise<CourseResponseDto> {
    const course = await this.repository.create(dto);
    return this.toResponseDto(course);
  }

  async update(id: string, dto: UpdateCourseDto): Promise<CourseResponseDto> {
    // Ensure course exists and is not deleted
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Course');

    // Business rule: no fields provided
    if (Object.keys(dto).length === 0) {
      throw new BusinessRuleException('At least one field must be provided for update');
    }

    const updated = await this.repository.update(id, dto);
    if (!updated) throw new NotFoundException('Course');

    return this.toResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.softDelete(id);
    if (!deleted) throw new NotFoundException('Course');
  }
}
