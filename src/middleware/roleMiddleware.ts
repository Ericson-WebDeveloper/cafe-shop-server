import {Request, Response, NextFunction} from 'express'
import { IUserType } from '../types/UserType';


export const RoleProtectAdmin = async(req: Request<{},{},{},{},{}>, res: Response, next: NextFunction) => {
                    //@ts-ignore
        const user: IUserType = req.user;
        if(!user) {
            let response = {message: 'You are unathenticated.', status: 401}; 
            return res.status(response.status).json({message: response.message});
        }
 
        if(user?.is_admin == false) {
            let response = {message: 'You are forbidden to this action.', status: 403}; 
            return res.status(response.status).json({message: response.message});
        }
        next();
    }


export const RoleProtectUser = async(req: Request, res: Response, next: NextFunction) => {
                    //@ts-ignore
        const user: IUserType = req.user;
        if(!user) {
            let response = {message: 'You are unathenticated.', status: 401}; 
            return res.status(response.status).json({message: response.message});
        }
        if(user?.is_admin == true) {
            let response = {message: 'You are forbidden to this action.', status: 403}; 
            return res.status(response.status).json({message: response.message});
        }
        next();
    }


export const RoleProtects = (admin: boolean) => {
    async(req: Request, res: Response, next: NextFunction) => {
                    //@ts-ignore
        const user = req.user;
        if(!user) {
            let response = {message: 'You are unathenticated.', status: 401}; 
            return res.status(response.status).json({message: response.message});
        }
    }
}