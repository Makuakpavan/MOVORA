/**
 * Shapes that describe the *envelope* your Express API puts around data.
 * Adjust these first if your backend wraps responses differently —
 * nothing else in the app needs to change.
 */

export interface ApiEnvelope<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalResults: number;
}

export interface ApiErrorShape {
  message: string;
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;
}

/** Normalised error thrown by the API client. Always this shape, never raw Axios. */
export class ApiError extends Error implements ApiErrorShape {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;

  constructor({ message, status, code, fieldErrors }: ApiErrorShape) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isNetwork() {
    return this.status === 0;
  }
}
