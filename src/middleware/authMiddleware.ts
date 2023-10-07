import { Response, Request, NextFunction } from "express";
import { validateAuthToken } from "../utility/tokenValidation";
import UserClass from "../class/UserClass";
import { IUserType } from "../types/UserType";

interface IAuthenticatedRequest extends Request {
  user: Omit<IUserType, "password">;
}

export const authenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { auth_token } = req.cookies;
  if (auth_token) {
    let response = validateAuthToken(auth_token);
    if (response === false) {
      return res
        .status(401)
        .json({
          message: "you are unauthenticated. token credentials is invalid.",
        });
    }                                               // as string
    let user = await UserClass.userFindByEmail(<string>response, false);
    if (!user) {
      return res
        .status(401)
        .json({
          message: "you are unauthenticated. token credentials is invalid.",
        });
    }
    //@ts-ignore
    req.user = user;
    next();
  } else {
    return res
      .status(401)
      .json({ message: "you are unauthenticated. please signin first." });
  }
};
