import { NextFunction, Request, Response } from 'express';
import { IProductType } from '../types/ProductType';
import { CreateProductValidation } from '../validations/ProductValidations';
import ProcductClass from '../class/ProcductClass';
import { uploadingAvatar } from '../utility/uploadFile';
import { loggerErrorData } from '../utility/errorLogger';


type ICreateProduct = Omit<IProductType, '_id'>

export const createNew = async (req: Request<{},{},ICreateProduct,{},{}>, res: Response, next: NextFunction) => {
    try {
        await CreateProductValidation(res, req.body);
        const datas = {
            name: req.body.name,
            image: (await uploadingAvatar(req.body.image)),
            categories: req.body.categories,
            description: req.body.description,
            status: req.body.status,
            default_price: req.body.default_price
        }
        let response = await ProcductClass.createNewProduct(datas);
        if(!response) {
            return res.status(400).json({message: 'Product Creation Failed'});
        }
        return res.status(200).json({message: 'Product Creation Success', product: response});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}})
    }
}


export const publicProductLists = async (req: Request<{},{},{},{page:null|string, category:string|null, filter:boolean|null},{}>, res: Response, next: NextFunction) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const category = req.query.category ? req.query.category : null;
        const filter = req.query.filter ? Boolean(req.query.filter) : null;
        let products = await ProcductClass.productLists(page, category, filter);
        return res.status(200).json({message: 'Products List', products});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}})
    }
}


export const updatingProductStatus = async (req: Request<{product_id:string},{},{},{},{}>, res: Response, next: NextFunction) => {
    try {
        const {product_id} = req.params
        let product = await ProcductClass.productByID(product_id);
        if(!product) {
            return res.status(400).json({message: 'Data Not Found. try Again'}); 
        }
        let response = await ProcductClass.updateProduct(product_id, {status: !product.status})
        if(!response) {
            return res.status(400).json({message: 'Product Updating Status Failed'}); 
        }
        return res.status(200).json({message: 'Product Updating Status Succes.', product: response}); 
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}})
    }
}

export const getProduct = async (req: Request<{product_id:string},{},{},{},{}>, res: Response, next: NextFunction) => {
    try {
        const {product_id} = req.params
        let product = await ProcductClass.productByID(product_id);
        if(!product) {
            return res.status(400).json({message: 'Data Not Found. try Again'}); 
        }
        return res.status(200).json({message: 'Product Get Success.', product: product}); 
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}})
    }
}