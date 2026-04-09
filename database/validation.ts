import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";

export type ValidationResult<T> =
  | { data: T; errors?: never }
  | { data?: never; errors: string[] };

export const validateDto = async <T extends object>(
  dtoClass: new () => T,
  body: any
): Promise<ValidationResult<T>> => {
  const instance = plainToInstance(dtoClass, body);
  const errors = await validate(instance as any);
  if (errors.length > 0) {
    const errorMessages = errors.map((err) => Object.values(err.constraints || {})).flat();
    return { errors: errorMessages };
  }
  return { data: instance };
};

