import jwt from 'jsonwebtoken';
import fs from 'fs';
import {Request, Response} from 'express';

export const generateAuthToken = (email: string) => {
    const src_folder = process.env.NODE_ENV == "DEV" ? "src" : "build";
    const privateKey = fs.readFileSync(`./${src_folder}/config/keys/private.pem`, { encoding: "utf8" });
    let token = jwt.sign({email}, privateKey, {
        expiresIn: '1d',
        algorithm: 'RS256'
    });
    return token;
}



export const removeTokens = (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.clearCookie('refresh_token');
    req.cookies['auth_token'] = '';
    req.cookies['refresh_token'] = '';
}