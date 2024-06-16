import { PrismaClient } from '@prisma/client';
import { secretCompare, secretHash } from '../../utils/hashSalt.js';

const prisma = new PrismaClient();

async function seed() {
	const hashedPassword = secretHash('password');

	const data_users = [
		{
			name: 'John Doe',
			phoneNumber: '+1234567890',
			address: 'Blitar',
			role: 'MEMBER',
			email: 'member@example.com',
			password: hashedPassword,
		},

		{
			name: 'John Cena',
			phoneNumber: '+6234567890',
			address: 'Blitar',
			role: 'MEMBER',
			email: 'anothermember@example.com',
			password: hashedPassword,
		},

		{
			name: 'Jane Smith',
			phoneNumber: '+9876543210',
			address: 'Blitar',
			role: 'ADMIN',
			email: 'admin@example.com',
			password: hashedPassword,
		},
	];

	const data_memberships = [
		{
			locationDisctance: 0.5,
			cost: 1500,
		},
		{
			locationDisctance: 1,
			cost: 1000,
		},
		{
			locationDisctance: 0.2,
			cost: 800,
		},
		{
			locationDisctance: 0.8,
			cost: 600,
		},
		{
			locationDisctance: 2,
			cost: 2000,
		},
	];

	const enum_problems = ['INSTALLATION', 'DAMAGE', 'DEVICE_PROBLEMS', 'SPEED_INCREASE', 'REPORT'];

	const users = await Promise.all(
		data_users.map(async (data) => {
			const user = await prisma.user.create({
				data: {
					name: data.name,
					phoneNumber: data.phoneNumber,
					role: data.role,
					address: data.address,
					auth: {
						create: {
							email: data.email,
							password: hashedPassword,
						},
					},
				},
			});
			return user;
		})
	);

	const memberships = await Promise.all(
		data_memberships.map(async (data) => {
			const randomUserIdx = Math.floor(Math.random() * users.length);
			const randomProblemIndex = Math.floor(Math.random() * enum_problems.length);
			const randomUser = users[randomUserIdx].id;
			const randomProblem = enum_problems[randomProblemIndex];
			const randomDate = new Date();
			randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 7));

			console.log(randomProblem);
			const membership = await prisma.membership.create({
				data: {
					userId: randomUser,
					locationDistance: data.locationDisctance,
					problem: randomProblem,
					cost: data.cost,
					status: 'PENDING',
					timeOfIncident: randomDate,
					description: 'description report',
				},
			});
			return membership;
		})
	);

	console.log('====================================');
	console.log(users);
	console.log('====================================');
	console.log(memberships);
	console.log('====================================');

	console.log(`Database seeded with ${users.count} users and ${memberships.count} memberships.`);
}

seed()
	.catch((e) => {
		console.error('Seeding failed!', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
