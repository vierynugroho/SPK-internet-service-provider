import { login, register, userLoggedIn } from '../controllers/auth.js';
import validator from '../libs/validator.js';

import { Router } from 'express';
import { LoginSchema, RegisterSchema } from '../utils/joi.js';
import authentication from '../middlewares/authentication.js';

const router = Router();

router.route('/login').post(validator(LoginSchema), login);
router.route('/register').post(validator(RegisterSchema), register);
router.route('/me').get(authentication, userLoggedIn);

export default router;
