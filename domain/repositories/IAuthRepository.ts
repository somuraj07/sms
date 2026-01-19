import { User, UserRole } from "../entities/User.entity";

/**
 * Repository Interface - Domain layer defines the contract
 * Infrastructure layer will implement this
 */
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  schoolId: string | null;
}

export interface IAuthRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: CreateUserData): Promise<User>;
  existsByEmail(email: string): Promise<boolean>;
}
