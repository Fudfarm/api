import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateM = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
      return;
    } catch (error: any) {
      const formattedErrors: Record<string, string[]> = {};

      if (error.errors && Array.isArray(error.errors)) {
        for (const err of error.errors) {
          const field = err.path.join(".");
          if (!formattedErrors[field]) {
            formattedErrors[field] = [];
          }
          formattedErrors[field].push(err.message);
        }
      }

      return res.status(417).json({
        message: "Data validation failed",
        errors: formattedErrors,
      });
    }
  };
};
