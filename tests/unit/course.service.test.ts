import { CourseService }    from '../../src/services/course.service';
import { CourseRepository } from '../../src/repositories/course.repository';
import { Course }           from '../../src/models/course.model';
import { NotFoundException, BusinessRuleException } from '../../src/exceptions/http.exception';

// ── Mock repository ───────────────────────────────────────────────────────────
jest.mock('../../src/repositories/course.repository');

const mockRepo = {
  findAll:    jest.fn(),
  findById:   jest.fn(),
  create:     jest.fn(),
  update:     jest.fn(),
  softDelete: jest.fn(),
} as unknown as CourseRepository;

const service = new CourseService(mockRepo);

// ── Fixtures ──────────────────────────────────────────────────────────────────
const fakeCourse: Course = {
  id:          'uuid-1',
  title:       'Test Course',
  description: 'desc',
  status:      'Pending',
  is_premium:  false,
  created_at:  new Date('2024-01-01'),
  updated_at:  new Date('2024-01-01'),
  deleted_at:  null,
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('CourseService', () => {

  beforeEach(() => jest.clearAllMocks());

  // ── getAll ────────────────────────────────────────────────────────────────
  describe('getAll', () => {
    it('returns paginated courses', async () => {
      (mockRepo.findAll as jest.Mock).mockResolvedValue({ rows: [fakeCourse], total: 1 });

      const result = await service.getAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.pages).toBe(1);
      expect(result.data[0]).not.toHaveProperty('deleted_at');
    });

    it('calculates pages correctly', async () => {
      (mockRepo.findAll as jest.Mock).mockResolvedValue({ rows: [], total: 50 });

      const result = await service.getAll({ page: 1, limit: 20 });
      expect(result.pagination.pages).toBe(3);
    });
  });

  // ── getById ───────────────────────────────────────────────────────────────
  describe('getById', () => {
    it('returns a course when found', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(fakeCourse);

      const result = await service.getById('uuid-1');
      expect(result.id).toBe('uuid-1');
      expect(result.title).toBe('Test Course');
    });

    it('throws NotFoundException when course not found', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getById('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('does not expose deleted_at field', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(fakeCourse);
      const result = await service.getById('uuid-1');
      expect(result).not.toHaveProperty('deleted_at');
    });
  });

  // ── create ────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('creates and returns a course', async () => {
      (mockRepo.create as jest.Mock).mockResolvedValue(fakeCourse);

      const result = await service.create({
        title:      'Test Course',
        status:     'Pending',
        is_premium: false,
      });

      expect(result.id).toBe('uuid-1');
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('updates a course', async () => {
      const updated = { ...fakeCourse, title: 'Updated Title' };
      (mockRepo.findById as jest.Mock).mockResolvedValue(fakeCourse);
      (mockRepo.update  as jest.Mock).mockResolvedValue(updated);

      const result = await service.update('uuid-1', { title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
    });

    it('throws NotFoundException when course does not exist', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.update('bad-id', { title: 'x' })).rejects.toThrow(NotFoundException);
    });

    it('throws BusinessRuleException when no fields provided', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue(fakeCourse);

      await expect(service.update('uuid-1', {})).rejects.toThrow(BusinessRuleException);
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────
  describe('delete', () => {
    it('soft-deletes a course', async () => {
      (mockRepo.softDelete as jest.Mock).mockResolvedValue(true);

      await expect(service.delete('uuid-1')).resolves.not.toThrow();
      expect(mockRepo.softDelete).toHaveBeenCalledWith('uuid-1');
    });

    it('throws NotFoundException when course not found', async () => {
      (mockRepo.softDelete as jest.Mock).mockResolvedValue(false);

      await expect(service.delete('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
