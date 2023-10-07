import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { env } from "../config/environment";
import { loggerErrorData } from "../utility/errorLogger";
export const errorHanlder = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  const statusCode = res.statusCode != 200 ? res.statusCode : 500;
  loggerErrorData(error.message || "Server is has error encounter. please try again later.");
  return res.status(statusCode).json({
    message:
      error.message || "Server is has error encounter. please try again later.",
    stack: env.NODE_ENV == "production" ? null : error.stack,
  });
};

export const apiRouteNotFound = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404);
  throw new Error("route not found");
};
