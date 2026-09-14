export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 400, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Anda tidak memiliki akses untuk melakukan tindakan ini.") {
    super(message, 403);
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = "Sesi telah berakhir atau belum login. Silakan login kembali.") {
    super(message, 401);
  }
}

export class ValidationError extends AppError {
  public fieldErrors?: Record<string, string[]>;

  constructor(message = "Data yang dikirim tidak valid.", fieldErrors?: Record<string, string[]>) {
    super(message, 422);
    this.fieldErrors = fieldErrors;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Data yang dicari tidak ditemukan.") {
    super(message, 404);
  }
}
