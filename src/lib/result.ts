/**
 * Standardized Action Result Interface across all Server Actions
 */
export type ActionResult<T = unknown> =
  | {
      success: true;
      data?: T;
      message?: string;
      error?: never;
      fieldErrors?: never;
    }
  | {
      success: false;
      error: string;
      message?: never;
      fieldErrors?: Record<string, string[]>;
      data?: never;
    };

export function successResult<T>(data?: T, message?: string): ActionResult<T> {
  return {
    success: true,
    ...(data !== undefined ? { data } : {}),
    ...(message ? { message } : {}),
  };
}

export function errorResult(error: string, fieldErrors?: Record<string, string[]>): ActionResult<never> {
  return {
    success: false,
    error,
    ...(fieldErrors ? { fieldErrors } : {}),
  };
}
