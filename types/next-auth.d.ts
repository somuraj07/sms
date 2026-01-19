import { Role } from "@/app/generated/prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      schoolId: string | null;
      schoolName: string | null;
      subjectsTaught?: string | null;
      mobile?: string | null;
    };
  }

  interface User {
    id: string;
    role: Role;
    schoolId: string | null;
    schoolName: string | null;
    subjectsTaught?: string | null;
    mobile?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    schoolId: string | null;
    schoolName: string | null;
    subjectsTaught?: string | null;
    mobile?: string | null;
  }
}

