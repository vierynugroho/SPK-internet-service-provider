import swaggerUI from 'swagger-ui-express';
import swaggerDocument from '../docs/swagger.json' with {type: "json"};
import { Router } from 'express';

import auth from './auth.js';
import membership from './membership.js';

const router = Router();

router.get("/documentation", (req, res) => res.redirect('https://documenter.getpostman.com/view/22814931/2sA3XJkQLg'));

router.get('/api/v1', (req, res, next) => {
	res.status(200).json({
		status: true,
		message: 'Welcome to API Akuhhh',
		docs: '/documentation',
	});
});

router.use('/api/v1/auth', auth);
router.use('/api/v1/memberships', membership);

export default router;
