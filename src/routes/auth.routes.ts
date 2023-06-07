import express from 'express';
import { createSessionHandler, refreshAccessTokenHandler } from 'src/controller/auth.controller';
import requireUser from 'src/middleware/requireUser';
import validate from 'src/middleware/validate';
import { createSessionSchema } from 'src/schema/auth.schema';

const router = express.Router();

router.post('/api/session', validate(createSessionSchema), createSessionHandler);

router.post('/api/session/refresh', requireUser, refreshAccessTokenHandler);

export default router;
