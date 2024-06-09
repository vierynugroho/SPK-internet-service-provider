import { serve, setup } from 'swagger-ui-express';
import swaggerDocument from '../docs/swagger.js';
import { Router } from 'express';

import auth from './auth.js';
import membership from './membership.js';

const router = Router();

router.get('/documentation.json', (req, res) => res.send(swaggerDocument));
router.use(
	'/api-docs',
	serve,
	setup(swaggerDocument, {
		customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
		customJs: ['https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js', 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js'],
	})
);

router.get('/api/v1', (req, res, next) => {
	res.status(200).json({
		status: true,
		message: 'Welcome to API Akuhhh',
	});
});

router.use('/api/v1/auth', auth);
router.use('/api/v1/memberships', membership);

export default router;
