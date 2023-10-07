import mongoose, {ConnectOptions} from "mongoose";

export const connectDb = async (): Promise<typeof mongoose> => {
    let respons = await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.1otugt6.mongodb.net/?retryWrites=true&w=majority`,
    {useNewUrlParser: true, useUnifiedTopology: true} as ConnectOptions);
    return respons;
}