import { NextFunction, Response, Request } from "express";
import Joi from "joi";
import { isBase64Costum } from "./ProductValidations";

export const CreateVariantValidation = async (
  res: Response,
  datas: Record<any, string | number | boolean | any[] | any>
) => {
  const ValidationSchema = Joi.object({
    name: Joi.string().required(),
    product: Joi.string().required(),
    status: Joi.boolean().required(),
  });
  let { error } = await ValidationSchema.validateAsync(datas, {
    abortEarly: false,
  });
  if (error) {
    return res.status(422).json({ errors: error });
  }
};

export const appendNewVariantSelectionValidation = async (
  res: Response,
  datas: Record<any, string | number | boolean | any[] | any>
) => {
  const ValidationSchema = Joi.object({
    variant: Joi.string().required(),
    name: Joi.string().required(),
    price: Joi.number().required(),
    image: Joi.string().custom(isBase64Costum),
    status: Joi.boolean().required(),
    pid: Joi.string().required(),
  });
  let { error } = await ValidationSchema.validateAsync(datas, {
    abortEarly: false,
  });
  if (error) {
    return res.status(422).json({ errors: error });
  }
};

export const updatingStatusVariantSelectionValidation = async (
  res: Response,
  datas: Record<any, string | number | boolean | any[] | any>
) => {
  const ValidationSchema = Joi.object({
    variant: Joi.string().required(),
    opt_id: Joi.string().required(),
    status: Joi.boolean().required(),
    pid: Joi.string().required(),
  });
  let { error } = await ValidationSchema.validateAsync(datas, {
    abortEarly: false,
  });
  if (error) {
    return res.status(422).json({ errors: error });
  }
};
