import {NextFunction, Request, Response, Router} from 'express';
import { createNew, getCategories } from '../controller/CategoryController';
import { authenticated } from '../middleware/authMiddleware';
import { RoleProtectAdmin } from '../middleware/roleMiddleware';
const router = Router();

router.get('/lists', getCategories);
router.post('/create-new', authenticated, RoleProtectAdmin, createNew);

export default router;