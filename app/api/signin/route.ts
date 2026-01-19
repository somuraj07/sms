import { NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { SigninRequestDTO } from "@/application/dtos/SigninDTO";

/**
 * API Route Handler - Presentation Layer
 * Uses clean architecture with dependency injection
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Create DTO
    const signinRequest: SigninRequestDTO = {
      email,
      password,
    };

    // Execute use case via controller
    const controller = container.authController;
    const result = await controller.signin(signinRequest);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: result.message, data: result.data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
