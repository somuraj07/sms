import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/db";
import { Role } from "@/app/generated/prisma/client";
import { container } from "@/infrastructure/di/container";
import { SigninRequestDTO } from "@/application/dtos/SigninDTO";

/**
 * NextAuth Configuration - Uses clean architecture
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Use clean architecture signin use case
          const signinRequest: SigninRequestDTO = {
            email: credentials.email,
            password: credentials.password,
          };

          const controller = container.authController;
          const result = await controller.signin(signinRequest);

          if (!result.success || !result.data) {
            return null;
          }

          // Get school name and teacher subjects if needed
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              school: {
                select: { name: true },
              },
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              schoolId: true,
              school: {
                select: { name: true },
              },
              subjectsTaught: true,
              mobile: true,
            },
          });

          // Return minimal user object for NextAuth
          return {
            id: result.data.id,
            name: result.data.name,
            email: result.data.email,
            role: result.data.role,
            schoolId: result.data.schoolId,
            schoolName: user?.school?.name ?? null,
            subjectsTaught: user?.subjectsTaught ?? null,
            mobile: user?.mobile ?? null,
          };
        } catch (error) {
          console.error("NextAuth authorize error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      // First login only
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.schoolId = user.schoolId;
        token.schoolName = user.schoolName;
        token.subjectsTaught = (user as any).subjectsTaught;
        token.mobile = (user as any).mobile;
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        role: token.role as Role,
        schoolId: token.schoolId as string | null,
        schoolName: token.schoolName as string | null,
        subjectsTaught: token.subjectsTaught as string | null,
        mobile: token.mobile as string | null,
      };

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
