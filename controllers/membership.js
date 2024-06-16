import AHP from 'ahp';
import { PrismaClient } from '@prisma/client';
import createHttpError from 'http-errors';
import { calculateAHP } from '../services/ahp.js';

const prisma = new PrismaClient();
const ahpContext = new AHP();

const getMemberships = async (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const offset = (page - 1) * limit;

		let where;

		if (req.user.role === 'MEMBER') {
			where = {
				userId: req.user.id,
			};
		}

		const memberships = await prisma.membership.findMany({
			include: {
				ahp: true,
				user: {
					include: {
						auth: {
							select: {
								email: true,
							},
						},
					},
				},
			},
			where,
			orderBy: {
				ahp: {
					rankScore: 'desc',
				},
			},
			skip: offset,
			take: limit,
		});

		const count = await prisma.membership.count();

		res.status(200).json({
			status: true,
			message: 'membership data retrieved successfully',
			totalItems: count,
			pagination: {
				totalPage: Math.ceil(count / limit),
				currentPage: page,
				pageItems: memberships.length,
				nextPage: page < Math.ceil(count / limit) ? page + 1 : null,
				prevPage: page > 1 ? page - 1 : null,
			},
			data: memberships.length !== 0 ? memberships : 'membership data is empty',
		});
	} catch (error) {
		next(createHttpError(500, { message: error.message }));
	}
};

const getMembership = async (req, res, next) => {
	try {
		const { id } = req.params;
		let where = {
			id,
		};

		if (req.user.role !== 'ADMIN') {
			where = {
				id,
				userId: req.user.id,
			};
		}

		const membership = await prisma.membership.findUnique({
			where,
			include: {
				user: {
					include: {
						auth: {
							select: {
								email: true,
							},
						},
					},
				},
				ahp: true,
			},
		});

		if (!membership) {
			return next(
				createHttpError(404, {
					message: 'membership is not found',
				})
			);
		}

		res.status(200).json({
			status: true,
			message: 'membership data retrieved successfully',
			data: membership,
		});
	} catch (error) {
		next(
			createHttpError(500, {
				message: error.message,
			})
		);
	}
};

const createMembership = async (req, res, next) => {
	try {
		let { locationDistance, problem, timeOfIncident, cost, description } = req.body;

		if (!description) {
			description = `${req.user.name} - Jarak: ${locationDistance} km - Problem: ${problem} - Cost: Rp. ${cost}`;
		}

		const createdMembership = await prisma.membership.create({
			data: {
				userId: req.user.id,
				locationDistance,
				problem,
				cost,
				status: 'PENDING',
				timeOfIncident,
				description,
			},
		});

		const { output, members } = await calculateAHP(createdMembership.id, locationDistance, problem, timeOfIncident, cost);

		try {
			await prisma.$transaction(async (tx) => {
				console.log({
					members: members,
					ci: output.criteriaRankMetaMap.ci,
					cr: output.criteriaRankMetaMap.cr,
					rankedScores: output.rankedScores,
					rankedScoresLength: output.rankedScores.length,
				});

				await Promise.all(
					members.map(async (member, index) => {
						await tx.ahp.upsert({
							where: { membershipId: member },
							update: {
								ci: output.criteriaRankMetaMap.ci,
								cr: output.criteriaRankMetaMap.cr,
								rankScore: output.rankedScores[index],
							},
							create: {
								membershipId: member,
								ci: output.criteriaRankMetaMap.ci,
								cr: output.criteriaRankMetaMap.cr,
								rankScore: output.rankedScores[index],
							},
						});
					})
				);

				console.log({
					members: members.length,
					ci: output.criteriaRankMetaMap.ci,
					cr: output.criteriaRankMetaMap.cr,
					rankedScoresLength: output.rankedScores,
					rankedScores: output.rankedScores.length,
				});

				res.status(200).json({
					status: true,
					message: 'ahp calculated & membership data created successfully',
				});
			});
		} catch (error) {
			return next(
				createHttpError(422, {
					message: error.message,
				})
			);
		}
	} catch (error) {
		next(
			createHttpError(500, {
				message: error.message,
			})
		);
	}
};

const updateMembership = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { locationDistance, problem, timeOfIncident, cost, status, description } = req.body;

		let where = {
			id,
		};

		if (req.user.role !== 'ADMIN') {
			where = {
				id,
				userId: req.user.id,
			};
		}

		const membership = await prisma.membership.findUnique({
			where,
		});

		if (!membership) {
			return next(
				createHttpError(404, {
					message: 'membership is not found',
				})
			);
		}

		if (req.user.id !== membership.userId) {
			return next(
				createHttpError(403, {
					message: "you don't have access here",
				})
			);
		}

		await prisma.membership.update({
			where: {
				id,
				userId: req.user.id,
			},
			data: {
				locationDistance: locationDistance || membership.locationDistance,
				problem: problem || membership.problem,
				cost: cost || membership.cost,
				status: status || membership.status,
				timeOfIncident: timeOfIncident || membership.timeOfIncident,
				description: description || membership.description,
			},
		});

		const { output, members } = await calculateAHP(null, locationDistance, problem, timeOfIncident, cost);

		try {
			await prisma.$transaction(async (tx) => {
				console.log({
					members: members,
					ci: output.criteriaRankMetaMap.ci,
					cr: output.criteriaRankMetaMap.cr,
					rankedScores: output.rankedScores,
					rankedScoresLength: output.rankedScores.length,
				});

				await Promise.all(
					members.map(async (member, index) => {
						await tx.ahp.upsert({
							where: { membershipId: member },
							update: {
								ci: output.criteriaRankMetaMap.ci,
								cr: output.criteriaRankMetaMap.cr,
								rankScore: output.rankedScores[index],
							},
							create: {
								membershipId: member,
								ci: output.criteriaRankMetaMap.ci,
								cr: output.criteriaRankMetaMap.cr,
								rankScore: output.rankedScores[index],
							},
						});
					})
				);

				console.log({
					members: members.length,
					ci: output.criteriaRankMetaMap.ci,
					cr: output.criteriaRankMetaMap.cr,
					rankedScoresLength: output.rankedScores,
					rankedScores: output.rankedScores.length,
				});

				res.status(200).json({
					status: true,
					message: 'ahp calculated & membership data updated successfully',
				});
			});
		} catch (error) {
			return next(
				createHttpError(422, {
					message: error.message,
				})
			);
		}
	} catch (error) {
		next(
			createHttpError(500, {
				message: error.message,
			})
		);
	}
};

const deleteMembership = async (req, res, next) => {
	try {
		const { id } = req.params;

		let where = {
			id,
		};
		if (req.user.role !== 'ADMIN') {
			where = {
				id,
				userId: req.user.id,
			};
		}

		const membership = await prisma.membership.findUnique({
			where,
		});

		if (!membership) {
			return next(
				createHttpError(404, {
					message: 'membership is not found',
				})
			);
		}

		if (req.user.id !== membership.userId) {
			return next(
				createHttpError(403, {
					message: "you don't have access here",
				})
			);
		}

		await prisma.membership.delete({
			where: {
				id,
				userId: req.user.id,
			},
		});

		res.status(200).json({
			status: true,
			message: 'membership data deleted successfully',
		});
	} catch (error) {
		next(
			createHttpError(500, {
				message: error.message,
			})
		);
	}
};

export { getMembership, getMemberships, createMembership, updateMembership, deleteMembership };
