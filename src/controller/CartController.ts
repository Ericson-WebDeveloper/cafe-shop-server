import { Request, Response, NextFunction } from "express"
import { loggerErrorData } from "../utility/errorLogger";
import { ICartType } from "../types/Cart";
import { AddCartValidation } from "../validations/CartValidation";
import CartClass from "../class/CartClass";
import { getDateTimeNow } from "../utility/dateUtility";
import { IUserType } from "../types/UserType";
import { Types } from "mongoose";

type addCartType = Omit<ICartType, '_id'|'date'>;

export const addCart = async (req: Request<{},{},addCartType,{},{}>, res: Response, next: NextFunction) => {
    try {
                        //@ts-ignore
        const user = req.user
        await AddCartValidation(res, req.body);
        const { product, selections, qty, price, total_price} = req.body;
   
        let response = await CartClass.saveMyCart({product, user: user._id, selections: selections?.length == 0 ? [] : selections, 
                qty, price, date: getDateTimeNow(), total_price: qty * price});
        if(!response) {
            return res.status(400).json({message: 'Item Added To Cart Failed. Please Try Again.'});
        }
     
        return res.status(201).json({message: 'Item Added To Cart Success', cart: await 
        response.populate([{ path: 'user', select: '-password' },{ path: 'product' }, { path: 'selections' }])});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}})
    }
}

export const getMyCarts = async (req: Request<{},{},{},{},{}>, res: Response, next: NextFunction) => {
    try {
                    //@ts-ignore
        const user = req.user
        let carts = await CartClass.fetchAllMyCart(user._id);
        return res.status(201).json({message: 'Carts Item List', carts});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}})
    }
}


export const updateMyCart = async (req: Request<{},{},{qty: number, cart_id: string},{},{}>, res: Response, next: NextFunction) => {
    try {
                    //@ts-ignore
        const user = req.user
        const {cart_id, qty} = req.body;
        let cartItem = await CartClass.getCartById(cart_id);

        if(!cartItem || !(<Types.ObjectId>cartItem?.user?._id).equals(user._id)) { //cartItem?.user?._id as Types.ObjectId
            return res.status(400).json({message: 'Cart Item Not Found.'});
        }
        let total_price = qty * cartItem?.price!;

        let response = await CartClass.updateCart(cart_id, qty, total_price);

        if(!response) {
            return res.status(400).json({message: 'Cart Item Update Failed'});
        }
        return res.status(200).json({message: 'Cart Item Update Success', cart:response});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}})
    }
}


export const removeCartItem = async(req: Request<{cart_id: string},{},{},{},{}>, res: Response, next: NextFunction) => {
    try {
        const {cart_id} = req.params;
                    //@ts-ignore
        const user = req.user;
        const cartItem = await CartClass.getCartById(cart_id);
        
        if(!cartItem || !(<Types.ObjectId>cartItem?.user?._id).equals(user._id)) { //cartItem?.user?._id as Types.ObjectId
             ///(<Types.ObjectId>cartItem?.user?._id).equals(user._id)
            return res.status(400).json({message: 'Cart Item Not Found.'});
        }
        let response = await CartClass.removeCart(cart_id);
        if(!response) {
            return res.status(400).json({message: 'Cart Item Remove Failed. Please Try Again After Reloading Page'});
        }
        return res.status(200).json({message: 'Cart Item Remove', cart_id: cart_id});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}})
    }
}