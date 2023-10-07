import { Router } from 'express';
import { authenticated } from '../middleware/authMiddleware';
import { RoleProtectAdmin, RoleProtectUser } from '../middleware/roleMiddleware';
import { createPaymentIntent, createPaymentIntentCard, updatePaymentOrder, capturePaymentOrder, cancelRemovePayment} from '../controller/OrderController';
import { paymentsRecords } from '../controller/PaymentController';

const router = Router();

router.post('/create/intent', authenticated, RoleProtectUser, createPaymentIntent);
// router.post('/stripe/intent', authenticated, RoleProtectUser, createPaymentIntentCard);
router.post('/payment-paypal/capture', authenticated, RoleProtectUser, capturePaymentOrder);
router.post('/payment-finish/response', authenticated, RoleProtectUser, updatePaymentOrder);

router.delete('/payment-cancel/:payment_id', authenticated, RoleProtectUser, cancelRemovePayment);


router.get('/payments/records', authenticated, RoleProtectAdmin, paymentsRecords);

export default router;