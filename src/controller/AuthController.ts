import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import {
  AuthLoginValidation,
  AuthRegisterValidation,
} from "../validations/AuthValidations";
import UserClass from "../class/UserClass";
import EmailClass from '../class/EmailClass';
import { comparePass, hashPass } from "../utility/hasingPass";
import { generateAuthToken, removeTokens } from "../utility/tokenGenerator";
import { uploadingAvatar } from "../utility/uploadFile";
import { generateRandomString } from "../utility/stringUtility";
import { calDiffISODate, getDateTimeNow } from "../utility/dateUtility";
import AuthService from '../services/AuthService';
import { loggerErrorData } from "../utility/errorLogger";

export const register = async (
  req: Request<
    {},
    {},
    {
      name: string;
      email: string;
      password: string;
      avatar: string;
      address: string;
    },
    {},
    {}
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    //res, next,
    await AuthRegisterValidation(res, req.body);
    const userExist = await UserClass.userFindByEmail(req.body.email);
    if(userExist) {
      return res.status(400).json({message: 'email is already exist please use different email'})
    }

    let datas1 = {
      name: req.body.name,
      email: req.body.email,
      password: await hashPass(req.body.password),
      status: false
    };

    const responseUser = await UserClass.createUser(datas1);
    // let timestamp = new Date();
    const responseUseDetail = await UserClass.createUserDetail({
      avatar: (await uploadingAvatar(req.body.avatar)),
      address: req.body.address,
      user: responseUser._id,
      token: {
        code: generateRandomString(20),
        date: getDateTimeNow()
      }
    });
    let emailResponse = await EmailClass.newRegisterAccount({email: req.body.email, name: req.body.name, subject: 'Register Account', 
    code: responseUseDetail.token?.code!});
    if (responseUser && responseUseDetail && emailResponse) {
      return res
        .status(200)
        .json({ message: "Register Complete. you can activate now via email link." });
    } else {
      return res
        .status(400)
        .json({ message: "Register Failed. please try again." });
    }
  } catch (error: any) {
    loggerErrorData(error);
    return res
      .status(500)
      .json({ message: "Server Error Encounter", errors: { ...error } });
  }
};

export const signin = asyncHandler(
  async (
    req: Request<{}, {}, { email: string; password: string }, {}, {}>,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    await AuthLoginValidation(res, next, req.body);
    const { email, password } = req.body;
    const responseUser = await UserClass.userFindByEmail(email);
    await AuthService.signinValidatingUser(res, password, responseUser);
    let auth_token = generateAuthToken(responseUser!.email);
    if(!auth_token) {
      return res.status(400).json({message: 'System Authentication Failed to Process You Request. Please try Again'})
    }
    delete responseUser!.password;

    return res
      .status(200)
      .cookie("auth_token", auth_token, {
        // expires: new Date(Date.now() + (1000 * 60 * 60 * 1)), // 1h hr automatic in browser delete when expired
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 day
        secure: process.env.NODE_ENV == "PROD" ? true : false,
        httpOnly: true,
        // path: '/',
        // sameSite: 'none'
        sameSite: process.env.NODE_ENV == "PROD" ? "none" : "lax",
      })
      .json({ message: "Sign In Success.", user: responseUser });
  }
);


export const userSignOut = async (req: Request,  res: Response, next: NextFunction) => {
  try {
    removeTokens(req, res);
    return res.status(200).json({message: 'Logout Complete'});
  } catch (error: any) {
    loggerErrorData(error);
    removeTokens(req, res);
    return res
      .status(200)
      .json({ message: "Force Logout Complete", errors: { ...error } });
  }

}

export const activatingAccount = async (req: Request<{email: string, code: string}, {}, {}, {}, {}>,
  res: Response,
  next: NextFunction) => {
  try {
      const {email, code} = req.params;
      if(!email || !code) {
        return res.status(500).json({message: 'Invalid Action'});
      }
      let user = await UserClass.userFindByEmail(email);
      if(!user || !user.details?.token || !user.details?.token?.code || !user.details?.token?.date) {
        return res.status(500).json({message: 'Invalid Data Credentials'});
      }
      let startDate = getDateTimeNow();
      let {minutes} = calDiffISODate(startDate, user.details?.token?.date!);
      if(minutes >= 100) { // minutes >= 5
          // await UserClass.userUpdateById(user._id as string, {token: {code: ""}});
          return res.status(400).json({message: 'Token Expires. sorry you can request again.'});
      }
      let response = await UserClass.userUpdateById(<string>user._id, {status: true}); // user._id as string
      await UserClass.revokeUserToken(<string>user._id); //user._id as string
      if(!response) {
        return res.status(400).json({message: 'Activating Account Failed. Please Try Again Later.'});
      }
      return res.status(200).json({message: 'Activating Account Success. You Can Login Now.'});
  } catch (error: any) {
    loggerErrorData(error);
    return res
      .status(500)
      .json({ message: "Server Error Encounter", errors: { ...error } });
  }
}
