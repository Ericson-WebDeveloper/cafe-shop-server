import mongoose from "mongoose";
import Product from "../model/Product";
import { IResponseDataWithPages } from "../types/Helper";
import { IProductType } from "../types/ProductType";
import { IVariantType } from "../types/VarianType";
import { ICategoryType } from "../types/CategoryType";
import { IVariantSelectType } from "../types/VariantSelectionType";
import { Paginate } from "./PaginateClass";

class ProductClass extends Paginate {
  
  async createNewProduct(
    datas: Record<any, string | number | boolean | any[] | any>
  ) {
    return await Product.create(datas);
  }

  async updateProduct(
    id: string,
    datas: Record<any, string | number | boolean | any[] | any>
  ) {
    return await Product.findByIdAndUpdate(
      id,
      { ...datas },
      { returnDocument: "after" }
    );
  }

  async productByID(
    id: string
  ): Promise<IProductType & { variants: IVariantType[] }> {
    // return await Product.findOne({_id: id}).populate({path:'categories', populate: {path: }})
    let response = await Product.aggregate([
      {
        $lookup: {
          from: "variants",
          foreignField: "product",
          as: "variants",

          localField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "variantselections",
                foreignField: "variant",
                as: "selections",

                localField: "_id",
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "categories",
          foreignField: "_id",
          as: "categories",

          localField: "categories",
        },
      },
      // {   $unwind:"$categories" }, // ginagamit lang pag need sa match or conditional filtering
      {
        $match: {
          $and: [{ _id: new mongoose.Types.ObjectId(id) }],
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          image: 1,
          categories: 1,
          description: 1,
          status: 1,
          default_price: 1,
          variants: 1,
        },
      },
    ]);
    return response[0];
  }

  async productsCount(condition: Array<any>) {
    // return await Product.count();
    let response = await Product.aggregate([
      // {
      //     $lookup: {
      //         from: 'variants',
      //         foreignField: 'product',
      //         as: 'variants',

      //         localField: '_id',
      //         pipeline: [
      //             {
      //                 $lookup: {
      //                     from: 'variantselections',
      //                     foreignField: 'variant',
      //                     as: 'selections',

      //                     localField: '_id'
      //                 }
      //             }
      //         ]
      //     }
      // },
      // {   $unwind:"$variants" },
      {
        $lookup: {
          from: "categories",
          foreignField: "_id",
          as: "categories",

          localField: "categories",
          // pipeline: [
          //     {$match: {$expr: {$eq: ['categories', '_id'] } } },
          // ]
        },
      },
      // {   $unwind:"$categories" }, // ginagamit lang pag need sa match or conditional filtering --
      /// ginagamit lang page need object lang ireturn default kasi ay return array
      {
        $match: {
          $and: condition,
        },
      },
      { $count: "Total" },
    ]);

    return response[0]?.Total ? response[0].Total : 0;
  }

  responseFormatWithPaginate(page: number, total: number, limit: number) {
    let result: IResponseDataWithPages<
      IProductType & {
        categories: ICategoryType[];
        variants: IVariantSelectType[];
      }
    > = {
      totalDatas: 0,
      totalPage: 0,
      previous: null,
      next: null,
      currePage: 0,
      rowsPerPage: 0,
      data: [],
    };
    let startIndex = (page - 1) * limit;
    // let endIndex = (page + 1) * limit;
    let endIndex = page * limit;
    result.totalDatas = total;
    result.totalPage = Math.ceil(total / limit);
    result.previous =
      startIndex > 0
        ? { pageNumber: page - 1 === 0 ? null : page - 1, limit: limit }
        : null;
    // result.next = endIndex <= total ? { pageNumber: page + 1, limit: limit } : null;
    result.next =
      endIndex <= total ? { pageNumber: page + 1, limit: limit } : null;
    result.currePage = page;
    result.rowsPerPage = limit;
    return { result, startIndex, endIndex };
  }

  async productLists(
    page = 1,
    category: string | null,
    filter: boolean | null
  ) {
    // let result: IResponseDataWithPages<IProductType> = {
    //     totalDatas: 0,
    //     totalPage: 0,
    //     previous: null,
    //     next: null,
    //     currePage: 0,
    //     rowsPerPage: 0,
    //     data: []
    // }

    // let condition = category ? filter ? [
    //     { 'categories.name': { $regex: `.*${category}.*`, $options:  'i' } },
    //     {status: filter }
    // ] :  [
    //     { 'categories.name': { $regex: `.*${category}.*`, $options:  'i' } }
    // ] : [{}];
    let condition = [];
    if (category) {
      condition.push({
        "categories.name": { $regex: `.*${category}.*`, $options: "i" },
      });
    }

    if (filter) {
      condition.push({ status: filter });
    }
    let final_condition = condition.length > 0 ? condition : [{}];

    let limit = 5;
    let totalP = await this.productsCount(final_condition);
    // let { result, startIndex, endIndex } = this.responseFormatWithPaginate(
    //   page,
    //   totalP,
    //   limit
    // );
    let { result, startIndex, endIndex } = this.responsePaginate(page, totalP, limit);

    result.data = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "categories",
          foreignField: "_id",
          as: "categories",
          // pipeline: [
          //     {$match: {$expr: {$eq: ['categories', '_id'] } } },
          // ]
        },
      },
      // {   $unwind:  "$categories" }, // ginagamit lang pag need sa match or conditional filtering
      ///  ginagamit lang page need object lang ireturn default kasi ay return array
      {
        $lookup: {
          from: "variants",
          foreignField: "product",
          as: "variants",

          localField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "variantselections",
                foreignField: "variant",
                as: "selections",

                localField: "_id",
              },
            },
          ],
        },
      },
      //{   $unwind:"$variants" }, ginagamit lang page need object lang ireturn default kasi ay return array ito array talaga dapat no need to use

      {
        $match: {
          $and: final_condition,
        },
      },
      // {
      //     $project: {
      //         _id: 1,
      //         name: 1,
      //         image: 1,
      //         categories: 1,
      //         description: 1,
      //         status: 1,
      //         default_price: 1,
      //         variants: 1
      //     }
      // }
    ])
      .sort({ _id: -1 })
      .skip(startIndex)
      .limit(limit)
      .exec();

    return result;

    // let startIndex = (page - 1) * limit;
    // let endIndex = (page + 1) * limit;
    // result.totalDatas = totalP;
    // result.totalPage = Math.ceil(totalP / limit)
    // result.previous = startIndex > 0 ? { pageNumber: (page - 1 === 0) ? null : page - 1 , limit: limit } : null ;
    // result.next = endIndex <= totalP ? { pageNumber: page + 1, limit: limit } : null;
    // result.currePage = page;
    // result.rowsPerPage = limit;
  }

  async countsProduct() {
    return await Product.countDocuments();
  }
}

export default new ProductClass();
