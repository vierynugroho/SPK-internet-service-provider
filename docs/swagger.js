export default {
	openapi: '3.0.0',
	info: {
		title: 'team01-api-Skyfly Express-rest API Swagger Documentation',
		description:
			'Development For Final Project Binar FSW1 Team1 Fullstack Dashboard for a library designed to manage library data and a library website utilizing, Express.js as the backend and Postgress as the Database Management System (DBMS). Github: [TEAM1-API-SKYFLY](https://github.com/orgs/FSW-AND-BINAR-BATCH-6/repositories)',
		version: '1.0.0',
		license: {
			name: 'ISC',
			url: 'https://spdx.org/licenses/ISC.html',
		},
		contact: {
			name: 'team1-FSW1',
			url: 'https://github.com/orgs/FSW-AND-BINAR-BATCH-6/repositories',
		},
	},
	tags: [
		{
			name: 'Auths',
			description: 'this is the API for AUTHS resources',
		},
		{
			name: 'Airlines',
			description: 'this is the API for AIRLINES resources',
		},
		{
			name: 'Airports',
			description: 'this is the API for AIRPORTS resources',
		},
		{
			name: 'Flights',
			description: 'this is the API for FLIGHTS resources',
		},
		{
			name: 'Flight Seats',
			description: 'this is the API for FLIGHT SEATS resources',
		},
		{
			name: 'Tickets',
			description: 'this is the API for TICKETS resources',
		},
		{
			name: 'Transactions',
			description: 'this is the API for TRANSACTIONS resources',
		},
		{
			name: 'Transactions Detail',
			description: 'this is the API for TRANSACTIONS DETAIL resources',
		},
		{
			name: 'Users',
			description: 'this is the API for USERS resources',
		},
	],
	servers: [
		{
			url: 'https://backend-skyfly-c1.vercel.app/api/v1',
			description: 'deployment',
		},
		{
			url: 'http://localhost:2000/api/v1',
			description: 'localhost',
		},
	],
	paths: {
		'/auth/login': {
			post: {
				tags: ['Auths'],
				summary: 'Return result of user login API',
				description: 'This API is for user login',
				requestBody: {
					description: 'Request body for successful user login',
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									email: {
										type: 'string',
										example: 'skyflyproduction1@gmail.com',
									},
									password: {
										type: 'string',
										example: 'password',
									},
								},
							},
						},
					},
				},
				responses: {
					200: {
						description: 'Login success',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										status: {
											type: 'boolean',
											example: true,
										},
										message: {
											type: 'string',
											example: 'User logged in successfully',
										},
										_token: {
											type: 'string',
											example:
												'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNsd2hoaThrMjAwMDYzMjFlaGJxdzQ5ZWUiLCJuYW1lIjoiQWxpY2UiLCJlbWFpbCI6ImFsaWNlQHRlc3QuY29tIiwicGhvbmVOdW1iZXIiOiI2MjgxMjM0NTY3ODkiLCJpYXQiOjE3MTYzNjE4ODgsImV4cCI6MTcxNjQ0ODI4OH0.a74iFFNbBH1WoYABtONscTY4-2LdD7qjtaGnBkEEA4Q',
										},
									},
								},
							},
						},
					},
					401: {
						description: 'Wrong password',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										status: {
											type: 'integer',
											example: 401,
										},
										message: {
											type: 'string',
											example: 'Wrong password',
										},
									},
								},
							},
						},
					},
					404: {
						description: 'Wrong email',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										status: {
											type: 'integer',
											example: 404,
										},
										message: {
											type: 'string',
											example: 'email not registered',
										},
									},
								},
							},
						},
					},
					422: {
						description: 'Email invalid',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										status: {
											type: 'integer',
											example: 422,
										},
										message: {
											type: 'string',
											example: '"email" must be a valid email',
										},
									},
								},
							},
						},
					},
					423: {
						description: 'Password invalid',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										status: {
											type: 'integer',
											example: 423,
										},
										message: {
											type: 'string',
											example: '"password" length must be at least 8 characters long',
										},
									},
								},
							},
						},
					},
				},
			},
		},
	},
};
