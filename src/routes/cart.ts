import {Router} from 'express';
import { AddCartValidation } from '../validations/CartValidation';
import { authenticated } from '../middleware/authMiddleware';
import { addCart, getMyCarts, removeCartItem, updateMyCart } from '../controller/CartController';
import { RoleProtectUser } from '../middleware/roleMiddleware';

const router = Router();


router.post('/add-item', authenticated, RoleProtectUser, addCart);
router.get('/carts-list', authenticated, RoleProtectUser, getMyCarts);
router.put('/update/my-cart', authenticated, RoleProtectUser, updateMyCart);
router.delete('/remove/my-cart/:cart_id', authenticated, RoleProtectUser, removeCartItem);

export default router;