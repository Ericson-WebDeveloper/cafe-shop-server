import mongoose, {Types} from "mongoose";
import Cart from "../model/Cart";
import { ICartType } from "../types/Cart";
import { IUserType } from "../types/UserType";
import { IProductType } from "../types/ProductType";
import { IVariantSelectType } from "../types/VariantSelectionType";


type  GetCartByIdTypes = ICartType & {user: IUserType, product: IProductType, selections: IVariantSelectType[]}

class CartClass {

    async saveMyCart(datas: Record<any, string|number|boolean|any[]|any>) {
        return await Cart.create(datas);
    }

    async removeCarts(ids: string[]) {
        let ids_object: Types.ObjectId[] = ids?.map((id) => new mongoose.Types.ObjectId(id));
        return await Cart.deleteMany({_id:{$in: ids_object}});
    }

    async removeCart(id: string) {
        return await Cart.findByIdAndRemove(id);
    }

    async updateCart(id: string, qty: number, total_price: number) {
        return await Cart.findOneAndUpdate({_id: id}, {qty: qty, total_price:total_price}, {returnDocument: 'after'});
    }
                                        // Omit<ICartType, 'user'|'product'> & {user:IUserType, product: IProductType} | null
    async getCartById(id:string): Promise<GetCartByIdTypes | null> {
        let response = await Cart.aggregate([
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    as: 'user',

                    localField: 'user'
                }
            },
            {$unwind: {path: '$user' } },
            {
                $lookup: {
                    from: 'products',
                    foreignField: '_id',
                    as: 'product',

                    localField: 'product'
                }
            },
            {$unwind: {path: '$product'}},
            {
                $lookup: {
                    from: 'variantselections',
                    foreignField: '_id',
                    as: 'selections',

                    localField: 'selections'
                }
            },
            // {$unwind: {path: '$selections'}},
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id) 
                }
            },
            {
                $project: {
                    _id: 1,
                    user: 1,
                    product: 1,
                    selections: 1,
                    qty: 1,
                    price: 1,
                    total_price: 1,
                    date: 1
                }
            }
        ]);

        return response[0] ? response[0] : null;
    }
    async getCartsByIds(ids:string[]): Promise<GetCartByIdTypes[]> {
        let ids_object: Types.ObjectId[] = ids?.map((id) => new mongoose.Types.ObjectId(id));
        let response = await Cart.aggregate([
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    as: 'user',

                    localField: 'user'
                }
            },
            {$unwind: '$user' }, // {$unwind: {path: '$user' } }, // need neto kasi object lang to, ang default ng lookup ay array
            {
                $lookup: {
                    from: 'products',
                    foreignField: '_id',
                    as: 'product',

                    localField: 'product'
                }
            },
            {$unwind: '$product'}, // {$unwind: {path: '$product'}}, // need neto kasi object lang to, ang default ng lookup ay array
            {
                $lookup: {
                    from: 'variantselections',
                    foreignField: '_id',
                    as: 'selections',

                    localField: 'selections'
                }
            },
            // {$unwind: {path: '$selections'}}, // no need dito kasi array naman ito, ang default ng lookup ay array
            {
                $match: {
                    _id: {
                             $in: ids_object
                         }
                }
            },
            {
                $project: {
                    'user.password': 0
                    // _id: 1,
                    // user: 1,
                    // product: 1,
                    // selections: 1,
                    // qty: 1,
                    // price: 1,
                    // total_price: 1,
                    // date: 1
                }
            }
        ]);

        return response;
    }

    async fetchAllMyCart(id: string): Promise<Array<Omit<ICartType, 'user'> & {user: IUserType, product: IProductType, selections: IVariantSelectType[]}> | null> {
        return await Cart.aggregate([
            {
                $lookup: {
                    from: 'products',
                    foreignField: '_id',
                    as: 'product',

                    localField: 'product'
                }
            },
            {$unwind: {path: '$product'}}, // gamit nito ay ireturn as object ang default kasi ng lookup ay array ang nirereturn
            {
                $lookup: {
                    from: 'variantselections',
                    foreignField: '_id',
                    as: 'selections',

                    localField: 'selections'
                }
            },
            // {$unwind: {path: '$selections'}},
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    as: 'user',

                    localField: 'user'
                }
            },
             {$unwind: {path: '$user'}}, // gamit nito ay ireturn as object ang default kasi ng lookup ay array ang nirereturn
            {
                $match: {
                    'user._id': new mongoose.Types.ObjectId(id)
                }
            },
            {
                $project: {
                    'user.password': 0
                    // _id: 1,
                    // user: 1,
                    // product: 1,
                    // selections: 1,
                    // qty: 1,
                    // price: 1,
                    // total_price: 1,
                    // date: 1
                }
            }
        ]);
    }

}

export default new CartClass();