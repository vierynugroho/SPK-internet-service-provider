import createHttpError from 'http-errors';

export default (allowedRoles) => {
	return async (req, res, next) => {
		console.log(req.user);
		let role = req.user !== undefined ? req.user.role : 'MEMBER';
		console.log(`Role: ${req.user.role}`);
		console.log(`Allowed Role: ${allowedRoles}`);
		try {
			const user = req.user;
			if (!user) return next(createHttpError(401, { message: 'Unauthorized' }));
			if (!allowedRoles.includes(role)) {
				next(
					createHttpError(403, {
						message: 'Your role does not have access permissions',
					})
				);
			}
			next();
		} catch (error) {
			next(createHttpError(500, { message: error.message }));
		}
	};
};
