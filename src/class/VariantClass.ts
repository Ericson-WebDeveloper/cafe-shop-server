import mongoose from "mongoose";
import Variant from "../model/Variant";
import { IResponseDataWithPages } from "../types/Helper";
import { IVariantType } from "../types/VarianType";
import { IProductType } from "../types/ProductType";

class VariantClass {
  async createNew(datas: Record<any, string | any>) {
    return await Variant.create(datas);
  }

  responseFormatWithPaginate(page: number, total: number, limit: number) {
    let result: IResponseDataWithPages<IVariantType & {product: IProductType}> = {
      totalDatas: 0,
      totalPage: 0,
      previous: null,
      next: null,
      currePage: 0,
      rowsPerPage: 0,
      data: [],
    };

    let startIndex = (page - 1) * limit;
    let endIndex = page * limit; // let endIndex = (page + 1) * limit;
    result.totalDatas = total;
    result.totalPage = Math.ceil(total / limit);
    result.previous =
      startIndex > 0
        ? { pageNumber: page - 1 === 0 ? null : page - 1, limit: limit }
        : null;
    result.next =
      endIndex <= total ? { pageNumber: page + 1, limit: limit } : null;
    result.currePage = page;
    result.rowsPerPage = limit;
    return { result, startIndex, endIndex };
  }

  async fetchAll(page = 1) {
    // return await Variant.find({}).populate("product");

    // const condition: any[] = [];
    let limit = 5;
    let totalP = await this.variantsCount([{}]);
    let { result, startIndex, endIndex } = this.responseFormatWithPaginate(page,totalP,limit);

    result.data = await Variant.aggregate([
      {
        $lookup: {
          from: "products",
          foreignField: "_id",
          as: "product",

          localField: "product",
        },
      },
      {   $unwind: "$product" },
      {
        $lookup: {
          from: "variantselections",
          foreignField: "variant",
          as: "selections",

          localField: "_id",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          status: 1,
          product: 1,
          default: 1,
          selections: 1,
        },
      },
    ])
      .sort({ _id: -1 })
      .skip(startIndex)
      .limit(limit)
      .exec();

    return result;
  }

  async variantsCount(condition: Array<any>) {
    // return await Product.count();
    let response = await Variant.aggregate([
      {
        $lookup: {
          from: "products",
          foreignField: "_id",
          as: "products",

          localField: "product",
        },
      },
      {
        $lookup: {
          from: "variantselections",
          foreignField: "variant",
          as: "selections",

          localField: "_id",
        },
      },
      // {   $unwind:"$categories" }, // ginagamit lang pag need sa match or conditional filtering -- ginagamit lang page need object lang ireturn default
      // kasi ay returna array
      {
        $match: {
          $and: condition,
        },
      },
      { $count: "Total" },
    ]);
    return response[0]?.Total ? response[0].Total : 0;
  }

  async fetchById(id: string) {
    // return await Variant.findById(id).populate("product");
    let results = await Variant.aggregate([
      {
        $lookup: {
          from: "products",
          foreignField: "_id",
          as: "product",

          localField: "product",
        }
      },
      {   $unwind: "$product" }, //ginagamit lang page need object lang ireturn default kasi ay return array
      {
        $lookup: {
          from: "variantselections",
          foreignField: "variant",
          as: "selections",

          localField: "_id",
        }
      },
      {
        $match: {
          $and: [{ _id: new mongoose.Types.ObjectId(id) }],
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          status: 1,
          product: 1,
          default: 1,
          selections: 1,
        },
      },
    ]);
    return results[0];
  }

  async fetchByProduct(pid: string) {
    return await Variant.findOne({ product: pid }).populate("product");
  }

  async fetchById2(pid: string) {
    return await Variant.findOne({ product: pid }).populate("product");
  }

  async fetchByProduct2(pid: string) {
    return await Variant.find({ product: pid }).populate("product");
  }

  async updateStatus(pid: string, vid: string, status: boolean) {
    return await Variant.findOneAndUpdate(
      { _id: vid, product: pid },
      { status: status },
      { returnDocument: "after" }
    );
  }
}

export default new VariantClass();
