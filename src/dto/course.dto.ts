import { CourseStatus } from '../models/course.model';

// ── Request DTOs ──────────────────────────────────────────────────────────────

export interface CreateCourseDto {
  title:        string;
  description?: string;
  status:       CourseStatus;
  is_premium:   boolean;
}

export interface UpdateCourseDto {
  title?:       string;
  description?: string;
  status?:      CourseStatus;
  is_premium?:  boolean;
}

export interface PaginationQueryDto {
  page:  number;
  limit: number;
}

// ── Response DTOs ─────────────────────────────────────────────────────────────

export interface CourseResponseDto {
  id:          string;
  title:       string;
  description: string | null;
  status:      CourseStatus;
  is_premium:  boolean;
  created_at:  Date;
  updated_at:  Date;
}

export interface PaginatedResponseDto<T> {
  data:       T[];
  pagination: {
    total:  number;
    page:   number;
    limit:  number;
    pages:  number;
  };
}
