import {NextFunction, Request, Response, Router} from 'express';
import { AuthRegisterValidation } from '../validations/AuthValidations';
import { activatingAccount, register, signin, userSignOut } from '../controller/AuthController';
import { authenticated } from '../middleware/authMiddleware';
import multer from 'multer';
const upload = multer();
const router = Router();


router.post('/sign-up', upload.none(), register);
router.post('/sign-in', signin);
router.get('/user', authenticated, async (req: Request, res: Response, next: NextFunction) => {
                                                // @ts-ignore
    return res.status(200).json({message: '', user: req.user});
});
router.get('/acount-activation/:email/:code', activatingAccount);
router.post('/acount/signout', authenticated, userSignOut);

export default router;