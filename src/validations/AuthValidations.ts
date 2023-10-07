import { NextFunction, Response, Request } from "express";
import Joi from "joi";
import isBase64 from 'is-base64';


const isBase64Costum = (value: any) => {
    if(!isBase64(value, {mimeRequired: true})) {
        throw new Error('is invalid format')
    }
    return true
}                                           // res: Response, next: NextFunction,
export const AuthRegisterValidation = async ( res: Response, Register: Record<any, string|number|boolean|any[]|any>) => {
    const ValidationSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(6).max(40).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
        avatar: Joi.string().required().custom(isBase64Costum, "avatar invalid format"),
        address: Joi.string().required()
    });
    let {error} = await ValidationSchema.validateAsync(Register, {abortEarly: false});
    if(error) {
        return res.status(422).json({errors: error});
    }
    // return error;
};

// export const AuthRegisterValidation =  async(req: Request, res: Response, next: NextFunction)=> {
//     const ValidationSchema = Joi.object({
//         name: Joi.string().required(),
//         email: Joi.string().email().required(),
//         password: Joi.string().required().min(6).max(40).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
//         avatar: Joi.string().custom(isBase64Costum),
//         address: Joi.string().required()
//     });
//     let {error} = await ValidationSchema.validateAsync(req.body);
//     if(error) {
//         // return res.status(422).json({errors: error});
//         res.status(422);
//         next(error)
//     } else {
//         next()
//     }
// };


export const AuthLoginValidation = async (res: Response, next: NextFunction, Register: Record<any, string|number|boolean|any[]|any>) => {
    const ValidationSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    let {error} = await ValidationSchema.validateAsync(Register, {abortEarly: false});
    if(error) {
        return res.status(422).json({errors: error});
    }
};