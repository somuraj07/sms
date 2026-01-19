import { SignupUseCase } from "@/application/use-cases/SignupUseCase";
import { SigninUseCase } from "@/application/use-cases/SigninUseCase";
import { SignupRequestDTO } from "@/application/dtos/SignupDTO";
import { SigninRequestDTO } from "@/application/dtos/SigninDTO";
import { UserAlreadyExistsError, InvalidCredentialsError } from "@/domain/errors/AuthErrors";

/**
 * Presentation Layer - Controller
 * Handles HTTP requests and responses
 */
export class AuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly signinUseCase: SigninUseCase
  ) {}

  async signup(request: SignupRequestDTO) {
    try {
      const result = await this.signupUseCase.execute(request);
      return {
        success: true,
        data: result,
        message: "User created successfully",
      };
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        return {
          success: false,
          error: error.message,
          statusCode: 409,
        };
      }
      return {
        success: false,
        error: "Internal server error",
        statusCode: 500,
      };
    }
  }

  async signin(request: SigninRequestDTO) {
    try {
      const result = await this.signinUseCase.execute(request);
      return {
        success: true,
        data: result,
        message: "Sign in successful",
      };
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return {
          success: false,
          error: error.message,
          statusCode: 401,
        };
      }
      return {
        success: false,
        error: "Internal server error",
        statusCode: 500,
      };
    }
  }
}
