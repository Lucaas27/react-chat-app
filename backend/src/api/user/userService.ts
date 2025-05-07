import { StatusCodes } from "http-status-codes";

import type { User } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/common/utils/logger";

export class UserService {
	private userRepository: UserRepository;

	constructor(repository: UserRepository = new UserRepository()) {
		this.userRepository = repository;
	}

	// Retrieves all users from the database
	async findAll(): Promise<ServiceResponse<User[] | null>> {
		try {
			logger.debug("Attempting to retrieve all users");

			const users = await this.userRepository.findAllAsync();
			if (!users || users.length === 0) {
				logger.info("No users found in database");
				return ServiceResponse.failure(
					"No Users found",
					null,
					StatusCodes.NOT_FOUND,
				);
			}

			logger.info(`Successfully retrieved ${users.length} users`);
			return ServiceResponse.success<User[]>("Users found", users);
		} catch (ex) {
			const error = ex as Error;
			const errorMessage = `Failed to retrieve users: ${error.message}`;
			logger.error({ error: error.message, stack: error.stack }, errorMessage);

			return ServiceResponse.failure(
				"An error occurred while retrieving users.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Retrieves a single user by their ID
	async findById(id: number): Promise<ServiceResponse<User | null>> {
		try {
			logger.debug({ userId: id }, "Attempting to find user by ID");

			const user = await this.userRepository.findByIdAsync(id);
			if (!user) {
				logger.info({ userId: id }, "User not found with specified ID");
				return ServiceResponse.failure(
					"User not found",
					null,
					StatusCodes.NOT_FOUND,
				);
			}

			logger.info(
				{ userId: id, userName: user.name },
				"Successfully retrieved user",
			);
			return ServiceResponse.success<User>("User found", user);
		} catch (ex) {
			const error = ex as Error;
			const errorMessage = `Failed to find user with ID ${id}: ${error.message}`;
			logger.error(
				{ userId: id, error: error.message, stack: error.stack },
				errorMessage,
			);

			return ServiceResponse.failure(
				"An error occurred while finding user.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}

export const userService = new UserService();
