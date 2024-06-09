import { hashSync, compareSync } from 'bcrypt';

const secretHash = (string) => {
	const saltRounds = parseInt(process.env.SALT);
	const hashed = hashSync(string, saltRounds);
	return hashed;
};

const secretCompare = (data, hashed) => {
	return compareSync(data, hashed);
};

export { secretHash, secretCompare };
