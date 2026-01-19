import { UserRole } from "@/domain/entities/User.entity";

/**
 * Application Layer DTOs - Data Transfer Objects for use cases
 */
export interface SigninRequestDTO {
  email: string;
  password: string;
}

export interface SigninResponseDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string | null;
  schoolName: string | null;
}
