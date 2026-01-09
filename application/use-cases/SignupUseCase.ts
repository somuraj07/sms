import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { IPasswordService } from "@/domain/services/IPasswordService";
import { UserAlreadyExistsError } from "@/domain/errors/AuthErrors";
import { SignupRequestDTO, SignupResponseDTO } from "../dtos/SignupDTO";
import { User } from "@/domain/entities/User.entity";

/**
 * Use Case - Application layer business logic
 * Orchestrates domain entities and repositories
 */
export class SignupUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly passwordService: IPasswordService
  ) {}

  async execute(request: SignupRequestDTO): Promise<SignupResponseDTO> {
    // 1. Validate business rules
    const emailExists = await this.authRepository.existsByEmail(request.email);
    if (emailExists) {
      throw new UserAlreadyExistsError(request.email);
    }

    // 2. Hash password
    const hashedPassword = await this.passwordService.hash(request.password);

    // 3. Prepare user data for creation (repository will generate id and timestamps)
    const userData = {
      name: request.name,
      email: request.email,
      password: hashedPassword,
      role: request.role,
      schoolId: request.schoolId || null,
    };

    // 4. Persist via repository (returns domain entity)
    const createdUser = await this.authRepository.create(userData);

    // 5. Return DTO (without sensitive data)
    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      schoolId: createdUser.schoolId,
      createdAt: createdUser.createdAt,
    };
  }
}
