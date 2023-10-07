import {NextFunction, Request, Response, Router} from 'express';
import { createNew, getProduct, publicProductLists, updatingProductStatus } from '../controller/ProductController';
import { authenticated } from '../middleware/authMiddleware';
import { RoleProtectAdmin } from '../middleware/roleMiddleware';
const router = Router();


router.get('/products', publicProductLists);
router.post('/product-new', authenticated, RoleProtectAdmin, createNew);
router.put('/status-update/:product_id', authenticated, RoleProtectAdmin, updatingProductStatus);
// router.get('/fetch/:product_id', authenticated, RoleProtectAdmin, getProduct);
router.get('/fetch/:product_id', getProduct);
export default router;