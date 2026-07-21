import { Router } from 'express';
import { GearController } from './gear.controller.js';

const router = Router();

router.get('/', GearController.getAllGear);
router.get('/:id', GearController.getGearById);

export const GearRoutes = router;
