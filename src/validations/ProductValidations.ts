import { NextFunction, Response, Request } from "express";
import Joi from "joi";
import isBase64 from 'is-base64';


export const isBase64Costum = (value: any) => {
    if(!isBase64(value, {mimeRequired: true})) {
        throw new Error('is invalid format')
    }
    return true
} 

export const CreateProductValidation = async (res: Response,  datas: Record<any, string|number|boolean|any[]|any>) => {
    const ValidationSchema = Joi.object({
        name: Joi.string().required(),
        categories: Joi.array().items(Joi.string()).required(),
        image: Joi.string().custom(isBase64Costum).required(),
        status: Joi.boolean().required(),
        description: Joi.string().required(),
        default_price: Joi.number().required()
    });
    let {error} = await ValidationSchema.validateAsync(datas, {abortEarly: false});
    if(error) {
        return res.status(422).json({errors: error});
    } 
};