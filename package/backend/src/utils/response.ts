import { ErrorResponse, OkResponse } from 'src/types/response/_index';

// Function for OK response body construction
export function OkResponse<T>(data: T): OkResponse<T> {
  return {
    status: 'ok',
    data,
  };
}

// Function for error response body construction
export function ErrorResponse(message: string): ErrorResponse {
  return {
    status: 'error',
    message,
  };
}
