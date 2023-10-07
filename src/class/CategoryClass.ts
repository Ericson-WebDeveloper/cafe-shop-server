import Category from "../model/Category";

class CategoryClass {
    async createNew(datas: Record<any, string>) {
        return await Category.create(datas);
    }

    async fetchCatgories() {
        return await Category.find({});
    }

    async countsCategory() {
        return await Category.countDocuments();
    }

}

export default new CategoryClass();