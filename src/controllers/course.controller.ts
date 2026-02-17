import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/course.service';
import { CreateCourseDto, UpdateCourseDto } from '../dto/course.dto';

export class CourseController {
  constructor(private readonly service: CourseService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page  = parseInt(req.query['page']  as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const result = await this.service.getAll({ page, limit });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const course = await this.service.getById(req.params['id']!);
      res.status(200).json(course);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto    = req.body as CreateCourseDto;
      const course = await this.service.create(dto);
      res.status(201).json(course);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto    = req.body as UpdateCourseDto;
      const course = await this.service.update(req.params['id']!, dto);
      res.status(200).json(course);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params['id']!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
