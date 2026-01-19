import { UserRole } from "@/domain/entities/User.entity";

/**
 * Application Layer DTOs - Data Transfer Objects for use cases
 */
export interface SignupRequestDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  schoolId?: string | null;
}

export interface SignupResponseDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string | null;
  createdAt: Date;
}
