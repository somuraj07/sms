import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { IPasswordService } from "@/domain/services/IPasswordService";
import { InvalidCredentialsError } from "@/domain/errors/AuthErrors";
import { SigninRequestDTO, SigninResponseDTO } from "../dtos/SigninDTO";

/**
 * Use Case - Application layer business logic
 * Orchestrates domain entities and repositories
 */
export class SigninUseCase {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly passwordService: IPasswordService
  ) {}

  async execute(request: SigninRequestDTO): Promise<SigninResponseDTO> {
    // 1. Find user
    const user = await this.authRepository.findByEmail(request.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // 2. Verify password
    const isValid = await this.passwordService.compare(
      request.password,
      user.password
    );
    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    // 3. Return DTO (without sensitive data)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      schoolName: null, // Will be populated by infrastructure if needed
    };
  }
}
