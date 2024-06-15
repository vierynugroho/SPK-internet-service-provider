import AHP from 'ahp';
import { PrismaClient } from '@prisma/client';
import createHttpError from 'http-errors';

const prisma = new PrismaClient();
const ahpContext = new AHP();

const getMemberships = async (req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const offset = (page - 1) * limit;

		const memberships = await prisma.membership.findMany({
			include: {
				ahp: true,
				user: {
					include: {
						auth: {
							select: {
								email: true
							}
						}
					}
				},
			},
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
	const { id } = req.params;
	try {
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
				user: true,
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
		let { locationDistance, problem, timeOfIncident, cost } = req.body;

		const fetchMember = await prisma.membership.findMany({
			include: { user: true },
		});

		const members = fetchMember.map((data) => data.id);

		let alternative = [];
		let member_locationDistance = [];
		let member_problem = [];
		let member_timeOfIncident = [];
		let member_cost = [];
		let problemNumber;
		let toiNumber;

		fetchMember.forEach((data) => {
			if (data.problem === 'INSTALLATION') {
				data.problem = 2;
			} else if (data.problem === 'DAMAGE') {
				data.problem = 2;
			} else if (data.problem === 'REPORT') {
				data.problem = 1;
			} else if (data.problem === 'DEVICE_PROBLEMS') {
				data.problem = 1;
			} else if (data.problem === 'SPEED_INCREASE') {
				data.problem = 1;
			}

			alternative = members;
			member_locationDistance.push(data.locationDistance);
			member_problem.push(data.problem);

			if (data.timeOfIncident >= new Date(timeOfIncident)) {
				data.timeOfIncident = 1 / 2;
				toiNumber = 1;
			} else {
				data.timeOfIncident = 1;
				toiNumber = 1 / 2;
			}

			member_timeOfIncident.push(data.timeOfIncident);
			member_cost.push(data.cost);
		});

		if (problem === 'INSTALLATION') {
			problemNumber = 2;
		} else if (problem === 'DAMAGE') {
			problemNumber = 2;
		} else if (problem === 'REPORT') {
			problemNumber = 1;
		} else if (problem === 'DEVICE_PROBLEMS') {
			problemNumber = 1;
		} else if (problem === 'SPEED_INCREASE') {
			problemNumber = 1;
		}

		const createdMembership = await prisma.membership.create({
			data: {
				userId: req.user.id,
				locationDistance,
				problem,
				cost,
				status: 'PENDING',
				timeOfIncident,
			},
		});

		alternative.push(createdMembership.id);
		member_timeOfIncident.push(toiNumber);
		member_locationDistance.push(locationDistance);
		member_problem.push(problemNumber);
		member_cost.push(cost);

		ahpContext.import({
			items: alternative,
			criteria: ['timeOfIncident', 'problem', 'locationDistance', 'cost'],
			criteriaItemRank: {
				timeOfIncident: member_timeOfIncident,
				problem: member_problem,
				locationDistance: member_locationDistance,
				cost: member_cost,
			},
			criteriaRank: [
				[1, 3, 3, 5],
				[1 / 3, 1, 1, 3],
				[1 / 3, 1, 1, 3],
				[1 / 5, 1 / 3, 1 / 3, 1],
			],
		});
		const output = ahpContext.run();
		// CI = output.criteriaRankMetaMap.ci
		// CR = output.criteriaRankMetaMap.cr
		// scoreRank = output.rankedScores

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
		const { locationDistance, problem, timeOfIncident, cost, status } = req.body;

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
				locationDistance,
				problem,
				cost,
				status,
				timeOfIncident,
			},
		});

		res.status(200).json({
			status: true,
			message: 'membership data updated successfully',
		});
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
