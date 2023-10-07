import {Router} from 'express';
import { authenticated } from '../middleware/authMiddleware';
import { addCart, getMyCarts, updateMyCart } from '../controller/CartController';
import { RoleProtectAdmin, RoleProtectUser } from '../middleware/roleMiddleware';
import { allOrders, checkOutOrders, fetchOrder, getUserOrders, updatingStatusDelivery } from '../controller/OrderController';

const router = Router();

router.post('/checkout/orders', authenticated, RoleProtectUser, checkOutOrders);
router.get('/fetch/checkout-order/:order_id', authenticated, RoleProtectUser, fetchOrder);
router.get('/summary/order/:order_id', authenticated, RoleProtectUser, fetchOrder);
router.get('/backend/orders', authenticated,  RoleProtectAdmin, allOrders);
router.get('/users/my-orders', authenticated, RoleProtectUser, getUserOrders);
router.post('/delivery-status/changed', authenticated,  RoleProtectAdmin, updatingStatusDelivery)

export default router;