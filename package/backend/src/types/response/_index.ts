import { z, ZodType } from 'zod';

export type OkResponse<T> = {
  status: 'ok';
  data: T;
};

export const OkResponseZod = <T extends ZodType>(schema: T) => {
  return z.object({
    status: z.literal('ok'),
    data: schema,
  });
};

export type ErrorResponse = {
  status: 'error';
  message: string;
};

export const ErrorResponseZod = z.object({
  status: z.literal('error'),
  message: z.string(),
});

export type Response<T> = OkResponse<T> | ErrorResponse;

export const ResponseZod = <T extends ZodType>(schema: T) => {
  return z.union([OkResponseZod(schema), ErrorResponseZod]);
};
