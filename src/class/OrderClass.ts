import mongoose from "mongoose";
import Order from "../model/Order";
import OrderDetails from "../model/OrderDetails";
import { IResponseDataWithPages } from "../types/Helper";
import { IOrderType } from "../types/Order";
import { IOrderDetailsType } from "../types/OrderDetails";
import { IUserType } from "../types/UserType";
import { IPaymentType } from "../types/Payment";



class OrderClass {

    async createNewOrder(datas: Record<any, string|number|boolean|any[]|any>) {
        return await Order.create(datas);
    }
    //
    async createOrderDetail(datas: Omit<IOrderDetailsType, "_id">[]) {
        return await OrderDetails.insertMany(datas);
    }

    async createOrderOneDetail(datas: Record<any, string|number|boolean|any[]|any>) {
        return await OrderDetails.insertMany(datas);
    }

    async updateOrder(id: string, user: string, datas: Record<any, string|number|boolean|any[]|any>) {
        return await Order.findOneAndUpdate({_id: id, user: user}, {...datas}, {returnDocument: 'after'});
    }

    async ordersCount(condition: Array<any>): Promise<number> {
        // return await Product.count();
        let response = await Order.aggregate([
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    as: 'user',

                    localField: 'user'
                }
            },
            {   $unwind: {path: "$user" } },
            {
                $lookup: {
                    from: 'orderdetails',
                    foreignField: 'order',
                    as: 'order_details',

                    localField: '_id',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'products',
                                foreignField: '_id',
                                as: 'product',
            
                                localField: 'product'
                            }
                        },
                        {   $unwind: {path: "$product"} },
                        {
                            $lookup: {
                                from: 'variantselections',
                                foreignField: '_id',
                                as: 'selections',
            
                                localField: 'selections'
                            }
                        },
                        // {   $unwind: {path: "$selections"} },
                    ]
                }
            },
            // {   $unwind:"$order_details" }, // array kasi ito no need na toong unwind. default ni lookup ay array
            {
                $lookup: {
                    from: 'payments',
                    foreignField: 'order',
                    as: 'payments',

                    localField: '_id'
                }
            },
            {   $unwind: {path: "$payments" } },
            {
                $match: {
                    $and: condition
                }
            },
            { $count: "Total" }
        ]);
        return response[0]?.Total ? response[0].Total : 0;
    }

    responseFormatWithPaginate(page: number, total: number, limit: number) {
        // let result: IResponseDataWithPages<Omit<IOrderType, 'order_details' > & {order_details: IOrderDetailsType[]}> = {
        let result: IResponseDataWithPages<IOrderType & {user: IUserType, 
                            order_details: IOrderDetailsType[], payments: IPaymentType[]}> = {
            totalDatas: 0,
            totalPage: 0,
            previous: null,
            next: null,
            currePage: 0,
            rowsPerPage: 0,
            data: []
        }

        let startIndex = (page - 1) * limit;
        let endIndex = page * limit; // let endIndex = (page + 1) * limit;
        result.totalDatas = total;
        result.totalPage = Math.ceil(total / limit)
        result.previous = startIndex > 0 ? { pageNumber: (page - 1 === 0) ? null : page - 1 , limit: limit } : null ;
        result.next = endIndex <= total ? { pageNumber: page + 1, limit: limit } : null;
        result.currePage = page;
        result.rowsPerPage = limit;
        return {result, startIndex, endIndex};
    }


    // async fetchOrderById(id: string): Promise<Omit<IOrderType, 'user'|'order_details'> & {user:IUserType, order_details: IOrderDetailsType[]}> {
    async fetchOrderById(id: string): Promise<IOrderType & {user:IUserType, order_details: IOrderDetailsType[]}> {
        let result = await Order.aggregate([
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    as: 'user',

                    localField: 'user'
                }
            },
            {   $unwind: {path: "$user" } },
            {
                $lookup: {
                    from: 'orderdetails',
                    foreignField: 'order',
                    as: 'order_details',

                    localField: '_id',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'products',
                                foreignField: '_id',
                                as: 'product',
            
                                localField: 'product'
                            }
                        },
                        {   $unwind:"$product" },
                        {
                            $lookup: {
                                from: 'variantselections',
                                foreignField: '_id',
                                as: 'selections',
            
                                localField: 'selections'
                            }
                        },
                        // {   $unwind: "$selections" },
                    ]
                }
            },
            // {   $unwind:"$order_details" }, // array kasi ito no need na toong unwind. default ni lookup ay array
            {
                $lookup: {
                    from: 'payments',
                    foreignField: 'order',
                    as: 'payments',

                    localField: '_id'
                }
            },
            // {   $unwind: {path: "$payments" } },
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            { 
                $project:  {
                    // _id: 1,
                    'user.password': 0,
                    // user: 1,
                    // details: 1,
                    // date_created: 1,
                    // delivery_status: 1,
                    // payment_status: 1,
                    // payment_remarks: 1,
                    // payment_ref1: 1,
                    // payment_ref2: 1,
                    // total_price: 1,
                    // total_qty: 1,

                    // payments: 1,
                    // order_details: 1,
                }
            }
        ]);

        return result[0] ? result[0] : null;
    }
 
    async fetchUsersAllOrders(user: string, page: number) {
        let condition = [{ 'user._id': new mongoose.Types.ObjectId(user) }, {'delivery_remark': { $ne: 'New' }}]
        let totalCounts = await this.ordersCount(condition);
        let {result, startIndex, endIndex} = this.responseFormatWithPaginate(page, totalCounts, 5);

        result.data = await Order.aggregate([
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    as: 'user',

                    localField: 'user',
                    // pipeline: [
                    //     {
                    //         $lookup: {
                    //             from: 'userdetails',
                    //             foreignField: '_id',
                    //             as: 'details',
            
                    //             localField: 'user'
                    //         }
                    //     },
                    //     {   $unwind: {path: "$details"} },
                    // ]
                }
            },
            {   $unwind: {path: "$user" } },
            {
                $lookup: {
                    from: 'orderdetails',
                    foreignField: 'order',
                    as: 'order_details',

                    localField: '_id',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'products',
                                foreignField: '_id',
                                as: 'product',
            
                                localField: 'product'
                            }
                        },
                        {   $unwind: {path: "$product"} },
                        {
                            $lookup: {
                                from: 'variantselections',
                                foreignField: '_id',
                                as: 'selections',
            
                                localField: 'selections'
                            }
                        },
                        // {   $unwind: {path: "$selections"} },
                    ]
                }
            },
            // {   $unwind:"$order_details" },
            {
                $lookup: {
                    from: 'payments',
                    foreignField: 'order',
                    as: 'payments',

                    localField: '_id'
                }
            },
            {
                $match: {
                    $and: condition
                }
            },
            { 
                $project:  {
                    'user.password': 0
                    // _id: 1,
                    // user: 1,
                    // details: 1,
                    // date_created: 1,
                    // delivery_status: 1,
                    // payment_status: 1,
                    // payment_remarks: 1,
                    // payment_ref1: 1,
                    // payment_ref2: 1,
                    // total_price: 1,
                    // total_qty: 1,

                    // order_details: 1,
                }
            }
        ]).sort({date_created: -1})
        .skip(startIndex)
        .limit(5)
        .exec();

        return result;
    }


    async fetchAllOrders(page: number) {
        let condition: any[] = [{}];
        let totalCounts = await this.ordersCount(condition);
        let {result, startIndex, endIndex} = this.responseFormatWithPaginate(page, totalCounts, 5);

        result.data = await Order.aggregate([
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    as: 'user',

                    localField: 'user',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'userdetails',
                                foreignField: 'user',
                                as: 'details',
            
                                localField: '_id'
                            }
                        },
                        {   $unwind: {path: "$details"} },
                    ]
                }
            },
            {   $unwind: {path: "$user" } },
            {
                $lookup: {
                    from: 'orderdetails',
                    foreignField: 'order',
                    as: 'order_details',

                    localField: '_id',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'products',
                                foreignField: '_id',
                                as: 'product',
            
                                localField: 'product'
                            }
                        },
                        {   $unwind: {path: "$product"} },
                        {
                            $lookup: {
                                from: 'variantselections',
                                foreignField: '_id',
                                as: 'selections',
            
                                localField: 'selections',
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: 'variants',
                                            foreignField: '_id',
                                            as: 'variant',
                        
                                            localField: 'variant'
                                        }
                                    },
                                    {   $unwind: {path: "$variant"} },
                                ]
                            }
                        },
                        // {   $unwind: {path: "$selections"} },
                    ]
                }
            },
            // {   $unwind:"$order_details" },
            {
                $match: {
                    $and: condition
                }
            },
            { 
                $project:  {
                    'user.password': 0
                    // _id: 1,
                    // user: 1,
                    // details: 1,
                    // date_created: 1,
                    // delivery_status: 1,
                    // payment_status: 1,
                    // payment_remarks: 1,
                    // payment_ref1: 1,
                    // payment_ref2: 1,
                    // total_price: 1,
                    // total_qty: 1,

                    // order_details: 1,
                }
            }
        ]).sort({date_created: -1})
        .skip(startIndex)
        .limit(5)
        .exec();

        return result;
    }

    async countsOrder() {
        return await Order.countDocuments();
    }
}


export default new OrderClass();