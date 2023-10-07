import { Response } from "express";
import Joi from "joi";


export const CheckOutValidation = async (res: Response, Cart: Record<any, string|number|boolean|any[]|any>) => {
    const ValidationSchema = Joi.object({
        carts: Joi.array().items(Joi.string()).required(),
        details: Joi.object({
            house_no: Joi.number().required(),
            city: Joi.string().required(),
            province: Joi.string().required(),
            zip_code: Joi.number().required(),
        })
    });
 
    let {error} = await ValidationSchema.validateAsync(Cart, {abortEarly: false});
    if(error) {
        return res.status(422).json({errors: error});
    }
};