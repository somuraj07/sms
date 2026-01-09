/**
 * Domain Entity - Pure business logic, no dependencies on infrastructure
 */
export type UserRole =
  | "SUPERADMIN"
  | "ADMIN"
  | "PRINCIPAL"
  | "HOD"
  | "EXAMINER"
  | "ACCOUNTANT"
  | "TEACHER"
  | "STUDENT"
  | "PARENT";

export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly password: string, // hashed
    public readonly role: UserRole,
    public readonly schoolId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Check if user has a specific role
   */
  hasRole(role: UserRole): boolean {
    return this.role === role;
  }

  /**
   * Domain method: Check if user is admin or higher
   */
  isAdminOrHigher(): boolean {
    return ["SUPERADMIN", "ADMIN", "PRINCIPAL"].includes(this.role);
  }

  /**
   * Domain method: Check if user belongs to a school
   */
  belongsToSchool(): boolean {
    return this.schoolId !== null;
  }
}
