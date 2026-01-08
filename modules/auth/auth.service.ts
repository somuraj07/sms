import { Role } from "@/app/generated/prisma/client";
import { AuthRepository } from "./auth.repository";
import { hashedPassword } from "@/lib/hash";



export class AuthService {
    private repo = new AuthRepository();
    async signup(name :string, email :string, password :string, role :Role){
        const existingUser = await this.repo.findbyEmail(email);
        if(existingUser){
            throw new Error("User already exists");
        }
        const hashed = await hashedPassword(password);
        return this.repo.createUser({
            name,
            email,
            password :hashed,
            role,
        })
    }
}