import { AuthService } from "@/modules/auth/auth.service";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    try {
        const { email, password, name, role } = await request.json();
        if (!email || !password || !name || !role) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // service logic to signup
        const authService = new AuthService();
        const user = await authService.signup(name, email, password, role);

        return NextResponse.json({ message: "User created successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error in signup" }, { status: 500 });
    }
}