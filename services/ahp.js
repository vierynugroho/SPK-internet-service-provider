import AHP from 'ahp';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ahpContext = new AHP();

const calculateAHP = async (membershipId, locationDistance, problem, timeOfIncident, cost) => {
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

	if (membershipId !== null) {
		alternative.push(membershipId);
		member_timeOfIncident.push(toiNumber);
		member_locationDistance.push(locationDistance);
		member_problem.push(problemNumber);
		member_cost.push(cost);
	}

	console.log('====================================');
	console.log(alternative);
	console.log('====================================');
	console.log(member_problem);
	console.log('====================================');
	console.log(member_timeOfIncident);
	console.log('====================================');
	console.log(member_cost);
	console.log('====================================');
	console.log(member_locationDistance);
	console.log('====================================');

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
	return { output, members };
};

export { calculateAHP };
