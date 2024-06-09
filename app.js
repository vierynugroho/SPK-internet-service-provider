import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import logger from 'morgan';
import MORGAN_FORMAT from './config/logger.js';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//* configuration to allow all origins and specific methods and headers.
app.use(
	cors({
		origin: '*',
		methods: 'GET, POST, PUT, PATCH, DELETE',
		allowedHeaders: 'Content-Type, Authorization',
	})
);

app.use(helmet());
app.use(express.json());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

//* Force the output to be application/json and remove fingerprint
app.use((req, res, next) => {
	res.removeHeader('X-Powered-By');
	res.setHeader('Content-Type', 'application/json');
	next();
});

app.use(router);

//* Error Handler with http-errors
app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.json({
		status: false,
		message: err.message,
	});
});

//* 404 Response Handler
app.use((req, res) => {
	const url = req.url;
	const method = req.method;
	res.status(404).json({
		status: false,
		code: 404,
		method,
		url,
		message: 'Not Found!',
		docs: '/documentation',
	});
});

export default app;
