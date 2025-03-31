import { ErrorResponse, OkResponse } from 'src/types/response/_index';

export function OkResponse<T>(data: T): OkResponse<T> {
  return {
    status: 'ok',
    data,
  };
}

export function ErrorResponse(message: string): ErrorResponse {
  return {
    status: 'error',
    message,
  };
}
