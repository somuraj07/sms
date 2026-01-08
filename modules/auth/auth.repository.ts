import { Role } from "@/app/generated/prisma/client";
import prisma from "@/lib/db";


export class AuthRepository {
    async findbyEmail(email :string){
        return prisma.user.findUnique({
            where : {
                email
            }
        })
    }
    async createUser(data:{
        name :string;
        email :string;
        password :string;
        role :Role;
        
    }){
        return prisma.user.create({
            data,
        });
    }
}
