import { NextFunction, Request, Response } from 'express';
import CategoryClass from '../class/CategoryClass';
import { loggerErrorData } from '../utility/errorLogger';


export const createNew = async (req: Request<{},{},{name:string},{},{}>, res: Response, next: NextFunction) => {
    try {
        if(!req.body.name || req.body.name == "") {
            return res.status(400).json({message: 'category name is required'});
        }
        let response = await CategoryClass.createNew({name: req.body.name});
        if(!response) {
            return res.status(400).json({message: 'Creating new Category Failed'});
        }
        return res.status(200).json({message: 'Creating new Category Success'});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}})
    }
}

export const getCategories = async (req: Request<{},{},{},{},{}>, res: Response, next: NextFunction) => {
    try {

        let response = await CategoryClass.fetchCatgories();
        if(response) {
            return res.status(200).json({message: 'Fetch Categories', categories:response});
        }
        return res.status(400).json({message: 'Fetch Categories Failed'});
    } catch (error: any) {
        loggerErrorData(error);
        return res.status(500).json({message: 'Server Error Encounter', errors: {...error}})
    }
}