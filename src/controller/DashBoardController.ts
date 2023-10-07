import { NextFunction, Request, Response } from 'express';
import PaymentClass from '../class/PaymentClass';
import { loggerErrorData } from '../utility/errorLogger';
import UserClass from '../class/UserClass';
import OrderClass from '../class/OrderClass';
import CategoryClass from '../class/CategoryClass';
import ProcductClass from '../class/ProcductClass';

export const dashBoardDatas = async (req: Request<{},{},{},{},{}>, res: Response, next: NextFunction) => {
    try {
        const userCounts = await UserClass.countsUser();
        const orderCounts = await OrderClass.countsOrder();
        const categoryCounts = await CategoryClass.countsCategory();
        const paymentCounts = await PaymentClass.countsPayments();
        const productCounts = await ProcductClass.countsProduct()
        return res.status(200).json({message: 'DashBoard Datas', userCounts, orderCounts, categoryCounts, paymentCounts, productCounts})
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}})
    }
}