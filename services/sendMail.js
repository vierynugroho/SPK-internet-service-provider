import { createTransport } from 'nodemailer';
const { APP_EMAIL, APP_PASS } = process.env;

const sendEmail = async (to, subject, text) => {
	const transport = createTransport({
		service: 'gmail',
		host: 'smtp.gmail.com',
		secure: true,
		auth: {
			user: APP_EMAIL,
			pass: APP_PASS,
		},
	});

	await transport.sendMail({ to, subject, text });
};

export { sendEmail };
