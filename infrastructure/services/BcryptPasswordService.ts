import { IPasswordService } from "@/domain/services/IPasswordService";
import bcrypt from "bcryptjs";

/**
 * Infrastructure Layer - Password Service Implementation
 * Uses bcrypt for password hashing
 */
export class BcryptPasswordService implements IPasswordService {
  private readonly SALT_ROUNDS = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
