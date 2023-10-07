import { Response } from "express";
import { IUserType } from "../types/UserType";
import { comparePass } from "../utility/hasingPass";

class AuthServiceClass {
  async signinValidatingUser(res: Response, password: string, user: IUserType | null ) {
    if (!user) {
        res.status(400);
        throw new Error('Invalid Credentials. please try again.');
    //   return res
    //     .status(400)
    //     .json({ message: "Invalid Credentials. please try again." });
    }

    if (user.status == false) {
        res.status(400);
        throw new Error('Activate Account First. please try again.');
    //   return res
    //     .status(400)
    //     .json({ message: "Activate Account First. please try again." });
    }

    if (!(await comparePass(password, user.password!))) {
        res.status(400);
        throw new Error('Invalid Credentials. please try again.');
    //   return res
    //     .status(400)
    //     .json({ message: "Invalid Credentials. please try again." });
    }
  }
}

export default new AuthServiceClass();
