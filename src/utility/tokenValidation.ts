import jwt from 'jsonwebtoken';
import fs from 'fs';
import { loggerErrorData } from './errorLogger';

export const validateAuthToken = (token: string): string|boolean => {
    try {
        const src_folder = process.env.NODE_ENV == "DEV" ? "src" : "build";
        const publicKey = fs.readFileSync(`./${src_folder}/config/keys/public.pem`, { encoding: "utf8" });
        let {email} = jwt.verify(token, publicKey) as {email: string};
        if(!email) {
            return false;
        }
        return email;
    } catch (error: any) {
        loggerErrorData(error);
        return false
    }
    
}