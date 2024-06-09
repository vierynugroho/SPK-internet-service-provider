import { PrismaClient } from '@prisma/client';
import createHttpError from 'http-errors';
import jsonwebtoken from 'jsonwebtoken';

const { verify } = jsonwebtoken;

const prisma = new PrismaClient();

export default async (req, res, next) => {
	try {
		const bearerToken = req.headers.authorization;

		if (!bearerToken) {
			return next(createHttpError(500, { message: 'Token not found!' }));
		}

		const token = bearerToken.split('Bearer ')[1];

		const payload = verify(token, process.env.JWT_SECRET);

		const user = await prisma.user.findUnique({
			where: {
				id: payload.id,
			},
			select: {
				id: true,
				name: true,
				role: true,
				phoneNumber: true,
				auth: {
					select: {
						id: true,
						email: true,
					},
				},
			},
		});

		req.user = user;
		if (req.user === null) {
			return next(createHttpError(401, 'Unauthorized, please re-login'));
		}
		next();
	} catch (error) {
		next(createHttpError(500, { message: error.message }));
	}
};
