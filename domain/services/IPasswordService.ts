/**
 * Password Service Interface - Domain layer defines the contract
 * Infrastructure layer will implement this
 */
export interface IPasswordService {
  hash(password: string): Promise<string>;
  compare(password: string, hashedPassword: string): Promise<boolean>;
}
