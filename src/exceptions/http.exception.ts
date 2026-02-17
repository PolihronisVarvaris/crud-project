export class HttpException extends Error {
  public readonly statusCode: number;
  public readonly code:       string;
  public readonly details?:   unknown;

  constructor(statusCode: number, message: string, code: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code       = code;
    this.details    = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundException extends HttpException {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}

export class ValidationException extends HttpException {
  constructor(details: unknown) {
    super(400, 'Validation failed', 'VALIDATION_ERROR', details);
  }
}

export class BusinessRuleException extends HttpException {
  constructor(message: string) {
    super(422, message, 'BUSINESS_RULE_VIOLATION');
  }
}
