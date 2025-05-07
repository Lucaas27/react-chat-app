import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import pinoHttp from "pino-http";

import { env } from "@/common/utils/envConfig";
import { logger } from "@/common/utils/logger";

const getLogLevel = (status: number) => {
	if (status >= StatusCodes.INTERNAL_SERVER_ERROR) return "error";
	if (status >= StatusCodes.BAD_REQUEST) return "warn";
	return "info";
};

const addRequestId = (req: Request, res: Response, next: NextFunction) => {
	const existingId = req.headers["x-request-id"] as string;
	const requestId = existingId || randomUUID();

	// Set for downstream use
	req.headers["x-request-id"] = requestId;
	res.setHeader("X-Request-Id", requestId);

	next();
};

const pinoHttpMiddleware = pinoHttp({
	logger,
	genReqId: (req) => req.headers["x-request-id"] as string,
	customLogLevel: (_req, res) => getLogLevel(res.statusCode),
	customSuccessMessage: (req) => `${req.method} ${req.url} completed`,
	customErrorMessage: (_req, res) =>
		`Request failed with status code: ${res.statusCode}`,
	serializers: {
		req: (req) => ({
			method: req.method,
			url: req.url,
			id: req.id,
			params: req.params,
			query: env.isDevelopment ? req.query : undefined, // Only log query in development
		}),
		res: (res) => ({
			statusCode: res.statusCode,
			responseTime: res.responseTime,
		}),
		err: (err) => ({
			type: err.type,
			message: err.message,
			stack: env.isDevelopment ? err.stack : undefined, // Only include stack trace in development
		}),
	},
});

const captureResponseBody = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (!env.isProduction) {
		const originalSend = res.send;
		res.send = function (body) {
			res.locals.responseBody = body;
			return originalSend.call(this, body);
		};
	}
	next();
};

export default [addRequestId, captureResponseBody, pinoHttpMiddleware];
