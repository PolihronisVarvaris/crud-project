import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationException } from '../exceptions/http.exception';

export function validate(rules: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(rules.map((rule) => rule.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const details = errors.array().map((e) => ({
        field:   'path' in e ? e.path : 'unknown',
        message: e.msg,
      }));
      return next(new ValidationException(details));
    }

    next();
  };
}
