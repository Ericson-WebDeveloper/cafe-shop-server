import { NextFunction, Request, Response } from 'express';
import PaymentClass from '../class/PaymentClass';
import { loggerErrorData } from '../utility/errorLogger';


export const paymentsRecords = async (req: Request<{},{},{},{page:string},{}>, res: Response, next: NextFunction) => {
    try {

        const page = req.query.page ? parseInt(req.query.page) : 1;

        const payments = await PaymentClass.fetchPayments(page, null, null)
        if(!payments) {
            return res.status(400).json({message: 'Payments Records Fetching Failed'});
        }
        return res.status(200).json({message: 'Payments Records Fetching Success', payments});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}})
    }
}