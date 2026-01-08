import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false }, // important for NeonDB
});

const prismaClientSinpngleton = () => {
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal?: ReturnType<typeof prismaClientSinpngleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSinpngleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}