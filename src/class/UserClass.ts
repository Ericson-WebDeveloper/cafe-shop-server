import mongoose from "mongoose";
import User from "../model/User";
import UserDetail from "../model/UserDetail";
import { IUserType } from "../types/UserType";


class UserClass {
    async createUser(datas: Record<any, string|number|boolean|any[]|any>) {
        return await User.create(datas);
    }

    async createUserDetail(datas: Record<any, string|number|boolean|any[]|any>) {
        return await UserDetail.create(datas);
    }



    async revokeUserToken(id:string) {
        return await UserDetail.findOneAndUpdate({user:id}, {token: {code: ""}});
    }

    async userFindById(id:string, pass: boolean = true): Promise<IUserType|null>  {
        // return await User.findOne({_id: id}).select('-password');
        let response = await User.aggregate([
            {
                $lookup: {
                    // from: 'UserDetail',
                    from: 'userdetails',
                    foreignField: 'user',
                    as: 'details',

                    localField: '_id'
                }
            },
            {$unwind: '$details'},
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $project: {
                    _id: 1,
                    details: 1,
                    name: 1,
                    password: {$cond: [{$eq: [pass, true]}, '$password', '$$REMOVE' ]},
                    email: 1,
                    status: 1,
                    is_admin: 1
                }
            },
        ]);
        return response ? response[0] : null
    }

    async userFindByEmail(email:string, pass: boolean = true): Promise<IUserType|null>  {
        // return await User.findOne({email: email}).select('-password');
        let response = await User.aggregate([
            {
                $lookup: {
                    from: 'userdetails',
                    foreignField: 'user',
                    as: 'details',

                    localField: '_id'
                }
            },
            {$unwind: '$details'},
            {
                $match: {email: email}
            },
            {
                $project: {
                    _id: 1,
                    details: 1,
                    name: 1,
                    password: {$cond: [{$eq: [pass, true]}, '$password', '$$REMOVE' ]},
                    email: 1,
                    status: 1,
                    is_admin: 1
                }
            }
        ]);
        return response ? response[0] : null
    }

    async userUpdateById(id:string, datas: Record<any, string|number|boolean|any[]|any>) {
        return await User.findByIdAndUpdate(id, {...datas}, {returnDocument: 'after'})
    }

    async userUpdateByEmail(email: string, datas: Record<any, string|number|boolean|any[]>) {
        return await User.findOneAndUpdate({email: email}, {...datas}, {returnDocument: 'after'})
    }

    async userSearch(search: string|null) {
        return await User.aggregate([
            {
                $lookup: {
                    from: 'userdetails',
                    foreignField: 'user',
                    as: 'details',

                    localField: '_id'
                }
            },
            {$unwind: '$details'},
            {
                $match: {
                    $or: search ? [ {
                        name: { $regex: `.*${search}.*`, $options:  'i' }, 
                        email: { $regex: `.*${search}.*`, $options:  'i' }, 
                        'details.address': { $regex: `.*${search}.*`, $options:  'i' }, 
                        }] : [{}]
                }
            },
            {
                $project: {
                    _id: 1,
                    details: 1,
                    name: 1,
                    email: 1,
                    status: 1,
                    is_admin: 1
                }
            }
        ])
        // .skip(startIndex)
        // .limit(limit)
        .exec();
    }

    async userSearchWithPagination(page: number, search: string|null) {
        let startIndex = await this.querySearchCount(search!)
        return await User.aggregate([
            {
                $lookup: {
                    from: 'userdetails',
                    foreignField: 'user',
                    as: 'details',

                    localField: '_id'
                }
            },
            {$unwind: '$details'},
            {
                $match: {
                    $or: search ? [ {
                        name: { $regex: `.*${search}.*`, $options:  'i' }, 
                        email: { $regex: `.*${search}.*`, $options:  'i' }, 
                        'details.address': { $regex: `.*${search}.*`, $options:  'i' }, 
                        }] : []
                }
            },
            {
                $project: {
                    _id: 1,
                    details: 1,
                    name: 1,
                    email: 1,
                    status: 1,
                    is_admin: 1
                }
            }
        ])
        .skip(startIndex)
        .limit(5)
        .exec();
    }

    async querySearchCount(search: string) {
        if(!search) {
            // return {$match};
            return await User.find({}).count();
        } else if(search) {
            return await User.find({}).count();
        } else {
            let conditions: any[] = [];
            if(search != '') {
            conditions = [ {
                    name: { $regex: `.*${search}.*`, $options:  'i' }, 
                    email: { $regex: `.*${search}.*`, $options:  'i' }, 
                    'details.address': { $regex: `.*${search}.*`, $options:  'i' }, 
                    }];
            }

            let final_condition = conditions.length > 0 ? conditions : [];
            let results = await User.aggregate([
                {
                    $lookup: {
                        from: 'UserDetail',
                        foreignField: 'user',
                        as: 'details',
    
                        localField: '_id'
                    }
                    
                },
                {   $unwind:"$details" },

                // {
                //     $addFields: {
                //         "user.fullname": {$concat: ["$user.firstname", " ", "$user.middlename", ". ", "$user.lastname"]},
                //         "issuedate":  { $substr : ["$issue_date", 0, 10 ] },
                //         "duedate":  { $substr : ["$due_date", 0, 10 ] },
                //         "returndate":  { $substr : ["$return_date", 0, 10 ] },
                //         // { $dateToString: {format: "%Y-%m-%d", date: "issue_date"} }
                //     }
                // },

                {
                    $match: {
                        $or: final_condition
                    }
                },
                {
                    $count: "users_count"
                }
            ]);
            return results.length > 0 ? results[0].users_count : 0;
        }
    }

    async countsUser() {
        return await User.countDocuments();
    }
}

export default new UserClass;