import { z, ZodType } from 'zod';

// OK response type
export type OkResponse<T> = {
  status: 'ok';
  data: T;
};

// Function to get the OK response in Zod schema
export const OkResponseZod = <T extends ZodType>(schema: T) => {
  return z.object({
    status: z.literal('ok'),
    data: schema,
  });
};

// Error response type
export type ErrorResponse = {
  status: 'error';
  message: string;
};

// Error response in Zod schema
export const ErrorResponseZod = z.object({
  status: z.literal('error'),
  message: z.string(),
});

// Union type for both OK and error responses
export type Response<T> = OkResponse<T> | ErrorResponse;

// Function to get the response in Zod schema
export const ResponseZod = <T extends ZodType>(schema: T) => {
  return z.union([OkResponseZod(schema), ErrorResponseZod]);
};
