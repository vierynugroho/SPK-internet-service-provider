import { login, register } from '../controllers/auth.js';
import validator from '../libs/validator.js';

import { Router } from 'express';
import { LoginSchema, RegisterSchema } from '../utils/joi.js';

const router = Router();

router.route('/login').post(validator(LoginSchema), login);
router.route('/register').post(validator(RegisterSchema), register);

export default router;
