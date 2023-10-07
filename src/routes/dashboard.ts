import {Router} from 'express';

import { authenticated } from '../middleware/authMiddleware';
import { RoleProtectAdmin } from '../middleware/roleMiddleware';
import { dashBoardDatas } from '../controller/DashBoardController';

const router = Router();


router.get('/datas', authenticated, RoleProtectAdmin, dashBoardDatas);


export default router;