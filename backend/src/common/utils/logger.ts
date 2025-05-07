import { env } from "@/common/utils/envConfig";
import { pino } from "pino";

// Define log levels with standardized labels
const LOG_LEVELS = {
	trace: "TRACE",
	debug: "DEBUG",
	info: "INFO",
	warn: "WARN",
	error: "ERROR",
	fatal: "FATAL",
};

// Define transport configuration based on environment
const transport = env.isProduction
	? undefined
	: {
			target: "pino-pretty",
			options: {
				colorize: true,
				translateTime: "SYS:standard",
				ignore: "pid,hostname",
				messageFormat:
					'{if msg === "request completed"}{req.method} {req.url} {res.statusCode} {responseTime}ms{else}{msg}{end}',
				levelFirst: true,
			},
		};

// Create and export a logger instance
export const logger = pino({
	name: "chat-app",
	level: env.isProduction ? "info" : "debug",
	transport,
	base: undefined, // Remove pid and hostname from all logs

	// Custom formatters
	formatters: {
		level: (label) => {
			const level = label as keyof typeof LOG_LEVELS;
			return {
				level,
				levelLabel: LOG_LEVELS[level] || label.toUpperCase(),
			};
		},
	},

	// Customize the timestamp format
	timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
});
