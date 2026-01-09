import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { IPasswordService } from "@/domain/services/IPasswordService";
import { PrismaAuthRepository } from "../repositories/PrismaAuthRepository";
import { BcryptPasswordService } from "../services/BcryptPasswordService";
import { SignupUseCase } from "@/application/use-cases/SignupUseCase";
import { SigninUseCase } from "@/application/use-cases/SigninUseCase";
import { AuthController } from "@/presentation/controllers/AuthController";

/**
 * Dependency Injection Container
 * Centralized place to wire up dependencies
 */
class Container {
  // Infrastructure Layer
  private _authRepository: IAuthRepository | null = null;
  private _passwordService: IPasswordService | null = null;

  // Application Layer
  private _signupUseCase: SignupUseCase | null = null;
  private _signinUseCase: SigninUseCase | null = null;

  // Presentation Layer
  private _authController: AuthController | null = null;

  // Getters with lazy initialization
  get authRepository(): IAuthRepository {
    if (!this._authRepository) {
      this._authRepository = new PrismaAuthRepository();
    }
    return this._authRepository;
  }

  get passwordService(): IPasswordService {
    if (!this._passwordService) {
      this._passwordService = new BcryptPasswordService();
    }
    return this._passwordService;
  }

  get signupUseCase(): SignupUseCase {
    if (!this._signupUseCase) {
      this._signupUseCase = new SignupUseCase(
        this.authRepository,
        this.passwordService
      );
    }
    return this._signupUseCase;
  }

  get signinUseCase(): SigninUseCase {
    if (!this._signinUseCase) {
      this._signinUseCase = new SigninUseCase(
        this.authRepository,
        this.passwordService
      );
    }
    return this._signinUseCase;
  }

  get authController(): AuthController {
    if (!this._authController) {
      this._authController = new AuthController(
        this.signupUseCase,
        this.signinUseCase
      );
    }
    return this._authController;
  }
}

// Singleton instance
export const container = new Container();
