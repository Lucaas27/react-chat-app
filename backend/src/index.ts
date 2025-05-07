import { env } from "@/common/utils/envConfig";
import { app, logger } from "@/server";

const server = app.listen(env.PORT, () => {
	const { NODE_ENV, HOST, PORT } = env;
	logger.info(
		`Server started successfully on http://${HOST}:${PORT} (${NODE_ENV})`,
	);
});

const onCloseSignal = () => {
	logger.info("Shutdown signal received, closing server...");
	server.close(() => {
		logger.info("Server shutdown completed");
		process.exit();
	});

	// Force shutdown after 10s if graceful shutdown fails
	setTimeout(() => {
		logger.error("Forced shutdown after timeout");
		process.exit(1);
	}, 10000).unref();
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
