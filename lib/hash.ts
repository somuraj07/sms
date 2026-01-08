import bcrypt from "bcrypt";

export const hashedPassword = async (password: string) => {
    return bcrypt.hash(password, 10);
};