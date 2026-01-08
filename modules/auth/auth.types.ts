/* =======================
   REQUEST DTO
======================= */

export interface SignupRequestDTO {
    name: string;
    email: string;
    password: string;
    role: "SUPERADMIN" | "ADMIN" | "PRINCIPAL" | "HOD" | "EXAMINER" | "ACCOUNTANT" | "TEACHER" | "STUDENT" | "PARENT";
  }
  
  /* =======================
     RESPONSE DTO
  ======================= */
  
  export interface SignupResponseDTO {
    id: string;
    name: string;
    email: string;
    role: "SUPERADMIN" | "ADMIN" | "PRINCIPAL" | "HOD" | "EXAMINER" | "ACCOUNTANT" | "TEACHER" | "STUDENT" | "PARENT";
    createdAt: Date;
  }
  
  /* =======================
     DOMAIN ENTITY
  ======================= */
  
  export interface UserEntity {
    id: string;
    name: string;
    email: string;
    password: string;
    role: "SUPERADMIN" | "ADMIN" | "PRINCIPAL" | "HOD" | "EXAMINER" | "ACCOUNTANT" | "TEACHER" | "STUDENT" | "PARENT";
    createdAt: Date;
  }
  
  /* =======================
     REPOSITORY CONTRACT
  ======================= */
  
  export interface IAuthRepository {
    findByEmail(email: string): Promise<UserEntity | null>;
    createUser(
      data: Omit<UserEntity, "id" | "createdAt">
    ): Promise<UserEntity>;
  }
  
  /* =======================
     SERVICE CONTRACT
  ======================= */
  
  export interface IAuthService {
    signup(data: SignupRequestDTO): Promise<SignupResponseDTO>;
  }
  