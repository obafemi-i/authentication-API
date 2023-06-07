import express from 'express';
import validate from '../middleware/validate';
import {
  createUserHnadler,
  forgotPasswordHandler,
  getCurrentUserHandler,
  resetPasswordHandler,
  verifyUserHandler,
} from '../controller/user.controller';

import { createUserSchema, forgotPasswordSchema, resetPasswordSchema, verifyUserSchema } from '../schema/user.schema';

const router = express.Router();

router.post('/api/users', validate(createUserSchema), createUserHnadler);

router.post('/api/users/validate/:id/:verificationCode', validate(verifyUserSchema), verifyUserHandler);

router.post('/api/users/forgot-password', validate(forgotPasswordSchema), forgotPasswordHandler);

router.post('/api/users/reset-password/:id/:passwordResetCode', validate(resetPasswordSchema), resetPasswordHandler);

router.get('/api/user/me', getCurrentUserHandler);

export default router;
