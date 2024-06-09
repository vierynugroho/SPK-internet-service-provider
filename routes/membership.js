import { createMembership, deleteMembership, getMembership, getMemberships, updateMembership } from '../controllers/membership.js';
import validator from '../libs/validator.js';
import authentication from '../middlewares/authentication.js';

import { Router } from 'express';
import checkRole from '../middlewares/checkRole.js';
import { MembershipSchema, UpdateMembershipSchema } from '../utils/joi.js';

const router = Router();

router
	.route('/')
	.post(authentication, checkRole(['ADMIN', 'MEMBER']), validator(MembershipSchema), createMembership)
	.get(authentication, checkRole(['ADMIN']), getMemberships);
router
	.route('/:id')
	.put(authentication, checkRole(['ADMIN', 'MEMBER']), validator(UpdateMembershipSchema), updateMembership)
	.delete(authentication, checkRole(['ADMIN', 'MEMBER']), deleteMembership)
	.get(authentication, checkRole(['ADMIN', 'MEMBER']), getMembership);

export default router;
