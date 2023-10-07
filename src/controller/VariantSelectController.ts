import { Request, Response, NextFunction } from "express"
import { IVariantSelectType } from "../types/VariantSelectionType"
import { appendNewVariantSelectionValidation, updatingStatusVariantSelectionValidation } from "../validations/VariantValidation"
import ProcductClass from "../class/ProcductClass"
import { uploadingAvatar } from "../utility/uploadFile"
import VarianSelectClass from "../class/VarianSelectClass"
import { loggerErrorData } from "../utility/errorLogger"

type IaddVariantOptionsType = Omit<IVariantSelectType, "_id"|"default_select"> & {pid:string}
export const addVariantOptions = async (req: Request<{},{},IaddVariantOptionsType,{},{}>, res: Response, next: NextFunction) => {
    try {
        await appendNewVariantSelectionValidation(res, req.body);

        const {pid, name, price, image, status, variant} = req.body;
        const product = await ProcductClass.productByID(pid);
        
        // select if the product variant has nay selections or none
        if(!product || product._id != pid) {
            return res.status(400).json({message: 'Product Not Found. please try again'});
        }
    
        if(product.variants.length > 0 && !product.variants?.some((varriant) => varriant._id == variant)) {
            return res.status(400).json({message: 'Sorry Invalid Data. please try again'});
        }
        let variantd = product.variants?.find((varriant) => varriant._id == variant);

        const datas = {
             name, 
             price, 
             image: image ? await uploadingAvatar(image) : '', 
             status, 
             variant,
             // set default_select -> true
             default_select: variantd && variantd?.selections?.length > 0 ? false : true
        }
        let response = await VarianSelectClass.appendNewOption(datas);
        if(!response) {
            return res.status(400).json({message: 'New Selection Option Added Failed. please try again'});
        }
        return res.status(200).json({message: 'New Selection Option Added Success', variant_selections: response});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}});
    }
}

export const updatingSelectionStatus = async (req: Request<{},{},{pid: string, variant: string, status: boolean, opt_id: string},{},{}>, res: Response, next: NextFunction) => {
    try {
        await updatingStatusVariantSelectionValidation(res, req.body)
        // service
        const {pid, variant, status, opt_id} = req.body;
        // service
        const product = await ProcductClass.productByID(pid);
        
        // select if the product variant has nay selections or none
        if(!product || product._id != pid) {
            return res.status(400).json({message: 'Product Not Found. please try again'});
        }
    
        if(product.variants.length > 0 && !product.variants?.some((varriant) => varriant._id == variant)) {
            return res.status(400).json({message: 'Sorry Invalid Data. please try again'});
        }
         // service

        let response = await VarianSelectClass.updateStatusOption(variant, opt_id, status);
        if(!response) {
            return res.status(400).json({message: 'Updating Selection Option Failed. please try again'});
        }
        return res.status(200).json({message: 'Updating Selection Option Success', variant_selections: response});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}});
    }
}   