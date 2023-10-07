import { Response } from "express";
import Joi from "joi";


export const AddCartValidation = async (res: Response, Cart: Record<any, string|number|boolean|any[]|any>) => {
    const ValidationSchema = Joi.object({
        product: Joi.string().required(),
        selections: Joi.array().items(Joi.string()).required(),
        qty: Joi.number().required(),
        price: Joi.number().required(),
        total_price: Joi.number().required()
    });
 
    let {error} = await ValidationSchema.validateAsync(Cart, {abortEarly: false});
    if(error) {
        return res.status(422).json({errors: error});
    }
};