import {
  Request,
  Response,
  NextFunction,
} from "express";

export class AppError extends Error {
  statusCode: number;

  constructor(
    message: string,
    statusCode = 500
  ) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("ERROR:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof Error) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
};