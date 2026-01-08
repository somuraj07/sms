import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export class AuthService {
  async signup(
    name: string,
    email: string,
    password: string,
    role: any
  ) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
  }

  async signin(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    return user;
  }
}
