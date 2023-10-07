import { NextFunction, Request, Response } from 'express';
import VariantClass from '../class/VariantClass';
import { IVariantType } from '../types/VarianType';
import { CreateVariantValidation } from '../validations/VariantValidation';
import { loggerErrorData } from '../utility/errorLogger';


export const getAll = async (req: Request<{},{},{},{page:string},{}>, res: Response, next: NextFunction) => {
    try {
        const {page} = req.query;
        let variants = await VariantClass.fetchAll(page ? Number(page) : 1);
        return res.status(200).json({message: 'Variants Fetchs', variants});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}})
    }
}

export const get = async (req: Request<{id:string},{},{},{},{}>, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params;
        let variant = await VariantClass.fetchById(id);
        return res.status(200).json({message: 'Variant Fetch', variant});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}})
    }
}

export const getWProduct = async (req: Request<{pid:string},{},{},{},{}>, res: Response, next: NextFunction) => {
    try {
        const {pid} = req.params;
        let variant = await VariantClass.fetchByProduct(pid);
        return res.status(200).json({message: 'Variant Fetch', variant});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}})
    }
}

export const updateStatus = async (req: Request<{pid:string, vid:string},{},{},{},{}>, res: Response, next: NextFunction) => {
    try {
        const {pid, vid} = req.params;
        // let variant = await VariantClass.fetchByProduct(pid);
        let variant = await VariantClass.fetchById(vid);
        if(!variant) {
            return  res.status(400).json({message: 'Data not Found'});
        }

        let response = await VariantClass.updateStatus(pid, vid, variant?.status ? false : true);
        if(!response) {
            return  res.status(400).json({message: 'Updating Failed'});
        }
        return  res.status(200).json({message: 'Updating Success', variant: response});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}});
    }
}

type VariantCreateType = Omit<IVariantType, '_id'|'default'>;
export const createNew = async (req: Request<{},{},VariantCreateType,{},{}>, res: Response, next: NextFunction) => {
    try {
        await CreateVariantValidation(res, req.body);
        const {product, name, status} = req.body;
        let variant = await VariantClass.fetchByProduct2(<string>product); //product as string
        const datas = {
            product,
            name: name,
            status: status,
            default: variant.length > 0 ? false : true
        }
        let response = await VariantClass.createNew(datas);
        if(!response) {
            return  res.status(400).json({message: 'Creating New Variant for Product Failed'});
        }
        return  res.status(200).json({message: 'Creating New Variant for Product', variant: response});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}});
    }
}