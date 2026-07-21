import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes.js';
import { GearRoutes } from '../modules/gear/gear.routes.js';
import { CategoryRoutes } from '../modules/category/category.routes.js';
import { RentalRoutes } from '../modules/rental/rental.routes.js';
import { PaymentRoutes } from '../modules/payment/payment.routes.js';
import { ProviderRoutes } from '../modules/provider/provider.routes.js';
import { ReviewRoutes } from '../modules/review/review.routes.js';
import { AdminRoutes } from '../modules/admin/admin.routes.js';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/gear', route: GearRoutes },
  { path: '/categories', route: CategoryRoutes },
  { path: '/rentals', route: RentalRoutes },
  { path: '/payments', route: PaymentRoutes },
  { path: '/provider', route: ProviderRoutes },
  { path: '/reviews', route: ReviewRoutes },
  { path: '/admin', route: AdminRoutes },
];

moduleRoutes.forEach((r) => router.use(r.path, r.route));

export default router;
