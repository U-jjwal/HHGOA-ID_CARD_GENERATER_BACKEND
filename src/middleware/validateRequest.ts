import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';

/**
 * Validates and replaces req.body with the parsed, type-safe result of the
 * given schema. Throws (via next) a ZodError on failure, handled centrally
 * by errorHandler. Accepts any ZodTypeAny (not just ZodObject) so schemas
 * built with .superRefine()/.refine() - which return ZodEffects - work too.
 */
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body);
    next();
  };
}

export function validateParams(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.params = schema.parse(req.params) as typeof req.params;
    next();
  };
}
