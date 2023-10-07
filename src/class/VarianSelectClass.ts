import VariantSelection from "../model/VariantSelection";



class VariantSelectClass {
    async appendNewOption(datas: Record<any, string|number|boolean|any[]|any>) {
        return await VariantSelection.create(datas);
    } 

    async updateStatusOption(vid: string, id: string, status: boolean) {
        return await VariantSelection.findOneAndUpdate({variant: vid, _id: id}, {
            status: status
        }, {returnDocument: 'after'});
    }
}


export default new VariantSelectClass();