import Joi from 'joi';

// auth
const LoginSchema = Joi.object({
	password: Joi.string().min(8).max(50).required(),
	email: Joi.string()
		.email({
			minDomainSegments: 2,
			maxDomainSegments: 3,
			tlds: { allow: ['com', 'net', 'id'] },
		})
		.required(),
});

const RegisterSchema = Joi.object({
	name: Joi.string()
		.min(3)
		.max(30)
		.regex(/^(?!\s*$)[a-zA-Z\s]+$/) //will allow user to input only alphabet and won't accept if there is only blank space
		.required(),
	email: Joi.string()
		.email({
			minDomainSegments: 2,
			maxDomainSegments: 3,
			tlds: { allow: ['com', 'net', 'id'] },
		})
		.required(),
	phoneNumber: Joi.string().min(11).max(16).required(),
	password: Joi.string().min(8).max(20).required(),
});

const MembershipSchema = Joi.object({
	locationDistance: Joi.number().required(),
	cost: Joi.number().min(0).required(),
	status: Joi.string().valid('PENDING', 'PROCESS', 'FINISHED').required(),
	problem: Joi.string().valid('INSTALLATION', 'DAMAGE', 'DEVICE_PROBLEMS', 'SPEED_INCREASE', 'REPORT').required(),
	timeOfIncident: Joi.string().required(),
	description: Joi.string(),
});

const UpdateMembershipSchema = Joi.object({
	locationDistance: Joi.number(),
	cost: Joi.number().min(0),
	status: Joi.string().valid('PENDING', 'PROCESS', 'FINISHED'),
	problem: Joi.string().valid('INSTALLATION', 'DAMAGE', 'DEVICE_PROBLEMS', 'SPEED_INCREASE', 'REPORT'),
	timeOfIncident: Joi.string(),
	description: Joi.string(),
});

export { LoginSchema, RegisterSchema, MembershipSchema, UpdateMembershipSchema };
