import mongoose from "mongoose";
import Payment from "../model/Payment";
import { IResponseDataWithPages } from "../types/Helper";
import { IPaymentType } from "../types/Payment";
import { IOrderType } from "../types/Order";

class PaymentClass {
  async createIntentPayment(
    datas: Record<any, string | number | boolean | any[] | any>
  ) {
    return await Payment.create(datas);
  }

  async updatePaymentCapture(
    id: string,
    datas: Record<any, string | number | boolean | any[] | any>
  ) {
    return await Payment.findByIdAndUpdate(
      id,
      { ...datas },
      { returnDocument: "after" }
    );
  }

  async getPaymentHistoryOrder(order_id: string) {
    return await Payment.find({ order: new mongoose.Types.ObjectId(order_id) });
  }

  async getPayment(id: string) {
    return await Payment.findOne({ _id: new mongoose.Types.ObjectId(id) });
  }

  async removePayment(payment_id: string) {
    return await Payment.findByIdAndRemove(payment_id);
  }

  responseFormatWithPaginate(page: number, total: number, limit: number) {
    let result: IResponseDataWithPages<(Omit<IPaymentType,'order'>&{order:IOrderType})> =
      {
        totalDatas: 0,
        totalPage: 0,
        previous: null,
        next: null,
        currePage: 0,
        rowsPerPage: 0,
        data: [],
      };

    let startIndex = (page - 1) * limit;
    let endIndex = page * limit;
    result.totalDatas = total;
    result.totalPage = Math.ceil(total / limit);
    result.previous = startIndex > 0 ? { pageNumber: page - 1 === 0 ? null : page - 1, limit: limit } : null;
    result.next = total > endIndex  ? { pageNumber: page + 1, limit: limit } : null;
    result.currePage = page;
    result.rowsPerPage = limit;
    return { result, startIndex, endIndex };
  }

  async paymentCounts(condition: Array<any>) {
    let response = await Payment.aggregate([
      {
        $lookup: {
          from: "orders",
          foreignField: "_id",
          as: "order",

          localField: "order",
          pipeline: [
            {
              $lookup: {
                from: "users",
                foreignField: "_id",
                as: "user",
      
                localField: "user",
                pipeline: [
                  {
                    $lookup: {
                      from: "userdetails",
                      foreignField: "user",
                      as: "details",
            
                      localField: "_id",
                    }
                  },
                   { $unwind: "$details" },
                ]
              }
            },
            { $unwind: "$user" },
          ]
    
        }
      },
      { $unwind: "$order" },
      {
        $match: {
          $and: condition,
        },
      },
      { $count: "Total" },
    ]);

    return response[0]?.Total ? response[0].Total : 0;
  }

  async fetchPayments(page = 1, search: string | null, filter: "pending" | "cancel" | "success" | null) {
    let condition = [];
    if (search) {
      condition.push({
        "categories.name": { $regex: `.*${search}.*`, $options: "i" },
      });
    }

    if (filter) {
      condition.push({ status: filter });
    }
    
    let final_condition = condition.length > 0 ? condition : [{}];

    let limit = 5;
    let totalP = await this.paymentCounts(final_condition);

    let { result, startIndex, endIndex } = this.responseFormatWithPaginate(page,totalP,limit);
  
    result.data = await Payment.aggregate([
      {
        $lookup: {
          from: "orders",
          foreignField: "_id",
          as: "order",

          localField: "order",
          pipeline: [
            {
              $lookup: {
                from: "users",
                foreignField: "_id",
                as: "user",
      
                localField: "user",
                pipeline: [
                  {
                    $lookup: {
                      from: "userdetails",
                      foreignField: "user",
                      as: "details",
            
                      localField: "_id",
                    }
                  },
                   { $unwind: "$details" },
                ]
              }
            },
            { $unwind: "$user" },
          ]
    
        },
      },
      { $unwind: "$order" },
      {
        $match: {
          $and: final_condition,
        },
      }
    ])
      .sort({ _id: -1 })
      .skip(startIndex)
      .limit(limit)
      .exec();
    return result;
  }

  async countsPayments() {
    return await Payment.countDocuments();
  }
}
export default new PaymentClass();
