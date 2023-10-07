import { NextFunction, Request, Response } from 'express'
import { IOrderType } from '../types/Order'
// import { AddCartValidation } from '../validations/CartValidation'
import CartClass from '../class/CartClass'
import { IOrderDetailsType } from '../types/OrderDetails'
import mongoose from 'mongoose'
import OrderClass from '../class/OrderClass'
import { getDateTimeNow } from '../utility/dateUtility'
import { computeTotalPriceOrder, computeTotalQtyOrder } from '../utility/computationUtility'
// import { ICartType } from '../types/Cart'
import { loggerErrorData } from '../utility/errorLogger'
import {Stripe} from 'stripe'
import PaypalClass from '../class/PaypalClass'
import PaymentClass from '../class/PaymentClass'
import { CheckOutValidation } from '../validations/OrderValidation'
// import Order from '../model/Order'
import { capturePaypalPayment, paypalPayment, stripePayment } from '../services/PaymentService'
import { IUserType } from '../types/UserType'

type ICheckOutOrdersType = Pick<IOrderType, 'details'>
export const checkOutOrders = async(req: Request<{},{}, ICheckOutOrdersType & {carts: string[]},{},{}>, res: Response, next: NextFunction) => {
    try {
        await CheckOutValidation(res, req.body);
        let orderCartsDatabase: any[] = [];
        const {carts, details} = req.body;
            //@ts-ignore
        const user = req.user;
        let orderCarts: Omit<IOrderDetailsType, '_id'>[] = [];

        orderCartsDatabase = await CartClass.getCartsByIds(carts)
        // carts?.forEach(async (cart_id, index) => {
        //     let response = await CartClass.getCartsByIds(cart_id);
        //     if(response) {
        //         orderCartsDatabase.push({...response});
               
        //     }
        // });

        if(!orderCartsDatabase || orderCartsDatabase.length == 0) {
            return res.status(400).json({message: "Server Error Encounter. Please try Again After Reloading Page"});
        }
        
        // create first Order Datas
        let orderCreated = await OrderClass.createNewOrder({
            user: user._id,
            details,
            carts: carts,
            date_created: getDateTimeNow(),
            delivery_status: false,
            payment_status: false,
            // payment_remarks: 'pending',
            // payment_ref1: '',
            // payment_ref2: '',
            delivery_remark: 'New',
            total_price: await computeTotalPriceOrder(orderCartsDatabase),
            total_qty: await computeTotalQtyOrder(orderCartsDatabase)
        });

        if(!orderCreated) {
            return res.status(400).json({message: 'Make Check Out Order Failed. Please Try Again After Refreshing Page.'});
        }

        orderCartsDatabase?.map(async (cart, index) => {
            orderCarts.push({
                order: orderCreated._id,
                product: new mongoose.Types.ObjectId(cart.product._id),
                selections: cart.selections,
                price: cart.price,
                total_qty: cart.qty,
                total_price: cart.qty * cart.price
            })
        });
        
        let orderCheckOutFinish = await OrderClass.createOrderDetail(orderCarts);
        if(!orderCheckOutFinish) {
            return res.status(400).json({message: 'Check Out Order Failed. Please Try Again After Refreshing Page.', 
           order_id_ref: orderCreated._id, order_qty: await computeTotalQtyOrder(orderCartsDatabase), 
           total_price: await computeTotalPriceOrder(orderCartsDatabase) });
        }
        // redirect the front-end to payment page
        return res.status(200).json({message: 'Make Check Out Order. Ready to Proceed to Pay', order_id_ref: orderCreated._id, order_qty: 
        await computeTotalQtyOrder(orderCartsDatabase), total_price: await computeTotalPriceOrder(orderCartsDatabase)});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: process.env.NODE_ENV == 'development' ? {...error} : ''})
    }
}

export const fetchOrder = async (req: Request<{order_id:string},{},{},{},{}>, res: Response, 
    next: NextFunction) => {
        try {
            const {order_id} = req.params;

            const order = await OrderClass.fetchOrderById(order_id);
            
            return res.status(order ? 200 : 400).json({
                order,
                message: order ? 'Order Fetch Complete' : 'Order Data Not Found'
            });
        } catch (error: any) {
            loggerErrorData(error);
            return res.status(500).json({message: 'Server Error Encounter', errors: process.env.NODE_ENV == 'development' ? {...error} : ''})
        }
}


export const updateOrders = async (req: Request<{},{},{payment_type: string, payment_reference: string, order_id: string},{},{}>, res: Response, 
            next: NextFunction) => {
    try {
        const { payment_type, payment_reference, order_id} = req.body;
                        //@ts-ignore
        const user = req.user;
        let orderCreateCheckout = await OrderClass.fetchOrderById(order_id);
        if(!orderCreateCheckout) {
            return res.status(400).json({message: 'Sorry Unable to Make A Payment for Your Order. Please Try Again LAter'});
        }
        let response = await OrderClass.updateOrder(order_id, user._id, {payment_ref1: payment_type,
            payment_ref2: payment_reference});
        if(!response) {
            return res.status(400).json({message: 'Sorry Unable to Make A Payment for Your Order. Please Try Again LAter'});
        }
        return res.status(200).json({message: 'Make Check Out Order.', order_detail: response});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: process.env.NODE_ENV == 'development' ? {...error} : ''})
    }
}

export const cancelRemovePayment = async (req: Request<{order_id: string},{},{},{},{}>, res: Response, next: NextFunction) => {
    try {
        const {order_id} = req.params;
        const response = await PaymentClass.removePayment(order_id);
        return res.status(200).json({message: 'Cancel Remove Payment'})
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: process.env.NODE_ENV == 'development' ? {...error} : ''})
    }
}

// Add Payment Model Type Class

export const updatePaymentOrder = async (req: Request<{},{},{order_id: string, status: boolean, payment_trans_id: string, 
    ref1?: string, ref2?: string},{},{}>, res: Response, next: NextFunction) => {
    try {
        const { status, order_id, payment_trans_id, ref1, ref2} = req.body;
                //@ts-ignore
        const user = req.user;
        let orderCreateCheckout = await OrderClass.fetchOrderById(order_id);
        if(!orderCreateCheckout) {
            return res.status(400).json({message: 'Sorry Unable to Make A Payment for Your Order. Please Try Again LAter'});
        }
        // if(status) {
            let paymentDetails = await PaymentClass.updatePaymentCapture(payment_trans_id, {payment_status: status, payment_remarks: status ? 'success' : 'cancel', 
            payment_ref3: ref1 ?? '', payment_ref4: ref2 ?? '', payment_created: getDateTimeNow()});
            const carts = JSON.parse(JSON.stringify(orderCreateCheckout.carts));
            let paymentResponse = await OrderClass.updateOrder(order_id, user._id, { payment_status: status == true ? true : false, carts: [], 
                delivery_remark: status ? 'Preparing' : 'Cancel'});
            // delete all Cart Connected to Order Data
  
            await CartClass.removeCarts(carts);
            // carts?.map(async(cart_id: string) => {
            //   await CartClass.removeCart(cart_id);
            // });
        // } else {
        //     let paymentResponse = await OrderClass.updateOrder(order_id, user._id, {payment_remarks, payment_status});
        // }
            // send email here
            return res.status(200).json({message: 'Payment Order Success', payment_detail: paymentDetails});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}})
    }
}

export const capturePaymentOrder = async(req: Request<{},{},{orderID: string, payment_type: string},{},{}>, res: Response, next: NextFunction) => {
    try {
        const {payment_type, orderID} = req.body
        if(payment_type == "paypal") {
            const response = await capturePaypalPayment(orderID);
            return res.status(200).json({message: 'Payment Confirm. Thank you', datas: response})
        }
        return res.status(400).json({message: "Cannot Defined Request. Please try again"});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: process.env.NODE_ENV == 'development' ? {...error} : ''})
    }
}


export const createPaymentIntentCard = async(req: Request<{},{},{total_amount: number, order_id: string},{},{}>, res: Response, next: NextFunction) => {
    try {
        const {total_amount, order_id} = req.body; 
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {apiVersion: '2023-08-16'});
        if(!stripe) {
            return res.status(400).json({message: "Payment Option Card Was Error. Please Try Again or Choose Paypal Instead"});
        }
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total_amount * 100,
            currency: "usd",
            // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables 
            // its functionality by default.
            automatic_payment_methods: {
              enabled: true,
            },
        });
          if(!paymentIntent) {
            return res.status(400).json({message: "Payment Option Card Was Error. Please Try Again or Choose Paypal Instead"});
          }
          
          let responePaymentIntent = await PaymentClass.createIntentPayment({order:order_id, 
            date_created: getDateTimeNow(), payment_type: 'Stripe - Card', payment_status: false, payment_remarks: 'pending', 
            total_payment: total_amount, payment_ref1: paymentIntent.id});
            if(responePaymentIntent) {                                                                                        // use this to front end
                return res.status(200).json({clientSecret: paymentIntent.client_secret, stripe_payment_ref: paymentIntent.id, payment_ref: responePaymentIntent._id,
                    payment_type: 'Stripe Card', 
                    message: `Payment via Card Attempt Success You Can Confirm to Finish Payment`});
            }
            return res.status(400).json({message: 'Payment via Card Attempt Attempt Failed'});

    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: process.env.NODE_ENV == 'development' ? {...error} : ''})
    }
}


export const createPaymentIntent = async(req: Request<{},{},{total_amount: number, order_id: string, payment_type:string},{},{}>, res: Response, next: NextFunction) => {
    try {
        const {payment_type} = req.body;
        if(payment_type == "stripe") {
            await stripePayment(req, res)
        } else if(payment_type == "paypal") {
            await paypalPayment(req, res)
        }else {
            return res.status(400).json({message: 'Payment failed cannot recognised payment option.'});
        }
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: process.env.NODE_ENV == 'development' ? {...error} : ''})
    }
}

export const createPaymentIntentPaypal = async(req: Request<{},{},{total_amount: number, order_id: string},{},{}>, res: Response, next: NextFunction) => {
    try {
        const {total_amount, order_id} = req.body;
        const accessToken = await PaypalClass.generateAccessToken(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_APP_SECRET!, 
            process.env.PAYPAL_BASE_AUTH_URL!);
        const url = `${process.env.PAYPAL_BASE_AUTH_URL!}/v2/checkout/orders`;
        const payload = {
            intent: "CAPTURE",
            purchase_units: [
                {
                        amount: {
                        currency_code: "USD",
                        value: total_amount * 100,
                    },
                }
            ],
        };
      
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            method: "POST",
            body: JSON.stringify(payload),
        });
      
        if (response.status === 200 || response.status === 201) {
            let paypalIntentRef = await response.json();
            let responePaymentIntent = await PaymentClass.createIntentPayment({order:order_id, 
                date_created: getDateTimeNow(), payment_type: 'Paypal', payment_status: false, payment_remarks: 'pending', 
                total_payment: total_amount, payment_ref1: paypalIntentRef.id});
            if(responePaymentIntent) {                                                                          // use this to front end
                return res.status(200).json({message: 'Paypal Payment Attempt Success', datas: paypalIntentRef, payment_ref: responePaymentIntent._id});
            }
            return res.status(400).json({message: 'Paypal Payment Attempt Failed'});
        }
        
        const errorMessage = await response.text();
        loggerErrorData(errorMessage);
        return res.status(500).json({message: 'Paypal Payment Option Error. Please Try Again or Choose Other Option'});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}})
    }
}




export const getUserOrders = async (req: Request<{},{},{},{page:string},{}>, res: Response, next: NextFunction) => {
    try {
                    //@ts-ignore
        const user = req.user;
        const page = req.query.page ? parseInt(req.query.page) : 1;

        const orders = await OrderClass.fetchUsersAllOrders(user._id, page);
        if(!orders) {
            return res.status(400).json({message: "Data Not Found"});
        }
        return res.status(200).json({message: "Order Datas Fetch", orders})
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: process.env.NODE_ENV == 'development' ? {...error} : ''})
    }
}


export const allOrders = async (req: Request<{},{},{},{page:string},{}>, res: Response, next: NextFunction) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const orders = await OrderClass.fetchAllOrders(page);
        if(!orders) {
            return res.status(400).json({message: "Data Not Found"});
        }
        return res.status(200).json({message: "Order Datas Fetch", orders})
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: process.env.NODE_ENV == 'development' ? {...error} : '' })
    }
}

export const updatingStatusDelivery = async(req: Request<{},{},{remarks: 'Cancel'|'Delivered'|'Preparing'|'On the Way', order_id:string},{},{}>, res: Response, next: NextFunction) => {
    try {
        const {remarks, order_id} = req.body;
        const order = await OrderClass.fetchOrderById(order_id);
        
        if(!order) {
            return res.status(400).json({message: 'Order Not Found'});
        }
        if(!order?.payment_status) {
            return res.status(400).json({message: 'Cannot Update Delivery Status. Order not Paid First.'});
        }
        if(order?.delivery_status) {
            return res.status(400).json({message: 'Order Already Delivered'});
        }
        if(order?.delivery_remark && order?.delivery_remark == remarks) {
            return res.status(400).json({message: 'Nothing to Update. Please check you Action.'});
        }
        const datas = {
            delivery_status: remarks == "Delivered" ? true : false,
            delivery_remark: remarks
        };
        const response = OrderClass.updateOrder(order_id, order?.user._id as string, datas);
        if(!response) {
            return res.status(400).json({message: 'Cannot Update Delivery Status. Please Try Again.'});
        }
        return res.status(200).json({message: 'Updating Delivery Status Success.', order: response});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: process.env.NODE_ENV == 'development' ? {...error} : '' })
    }
}