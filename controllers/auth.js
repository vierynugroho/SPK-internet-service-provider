import { PrismaClient } from '@prisma/client';
import createHttpError from 'http-errors';
import { secretCompare, secretHash } from '../utils/hashSalt.js';
import generateJWT from '../utils/jwtGenerate.js';

const prisma = new PrismaClient();

const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const user = await prisma.auth.findUnique({
			where: {
				email,
			},
			include: {
				user: true,
			},
		});

		if (!user) {
			return next(
				createHttpError(404, {
					message: 'Email is not registered',
				})
			);
		}

		if (user && secretCompare(password, user.password)) {
			const payload = {
				id: user.user.id,
				name: user.user.name,
				email: user.email,
				phoneNumber: user.user.phoneNumber,
			};

			const token = generateJWT(payload);

			res.status(200).json({
				status: true,
				message: 'login is successfully',
				_token: token,
			});
		} else {
			return next(createHttpError(401, { message: 'Wrong password' }));
		}
	} catch (error) {
		next(
			createHttpError(500, {
				message: error.message,
			})
		);
	}
};

const register = async (req, res, next) => {
	try {
		const { name, phoneNumber, password, email } = req.body;
		const hashedPassword = secretHash(password);

		// check email is unvailable
		const userExist = await prisma.auth.findUnique({
			where: {
				email,
			},
			include: {
				user: true,
			},
		});

		if (userExist) {
			return next(
				createHttpError(409, {
					message: 'Email has already been taken',
				})
			);
		}

		// insert data to db
		await prisma.user.create({
			data: {
				name: name,
				phoneNumber: phoneNumber,
				role: 'MEMBER',
				auth: {
					create: {
						email: email,
						password: hashedPassword,
					},
				},
			},
		});

		res.status(200).json({
			status: true,
			message: 'user registered successfully',
			data: {
				name,
				email,
				phoneNumber,
				role: 'MEMBER',
			},
		});
	} catch (error) {
		next(
			createHttpError(500, {
				message: error.message,
			})
		);
	}
};

export { login, register };
