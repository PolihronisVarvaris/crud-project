export type CourseStatus = 'Published' | 'Pending';

export const COURSE_STATUSES: CourseStatus[] = ['Published', 'Pending'];

export interface Course {
  id:          string;
  title:       string;
  description: string | null;
  status:      CourseStatus;
  is_premium:  boolean;
  created_at:  Date;
  updated_at:  Date;
  deleted_at:  Date | null;
}
