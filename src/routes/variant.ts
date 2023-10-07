import {NextFunction, Request, Response, Router} from 'express';
import { authenticated } from '../middleware/authMiddleware';
import { RoleProtectAdmin } from '../middleware/roleMiddleware';
import { get, getAll, getWProduct, updateStatus, createNew} from '../controller/VariantController';
import { addVariantOptions, updatingSelectionStatus } from '../controller/VariantSelectController';
const router = Router();


router.get('/lists', getAll);
router.get('/fetch/:id', get);
router.get('/fetch/:pid/product', getWProduct);
router.post('/new-create', authenticated, RoleProtectAdmin, createNew);
router.put('/update/:pid/:vid', authenticated, RoleProtectAdmin, updateStatus);

router.post('/append/selection', authenticated, RoleProtectAdmin, addVariantOptions);
router.put('/update/variant-selection', authenticated, RoleProtectAdmin, updatingSelectionStatus);

export default router;