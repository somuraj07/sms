import { NextResponse } from "next/server";
import { container } from "@/infrastructure/di/container";
import { SignupRequestDTO } from "@/application/dtos/SignupDTO";

/**
 * API Route Handler - Presentation Layer
 * Uses clean architecture with dependency injection
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role, schoolId } = body;

    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Create DTO
    const signupRequest: SignupRequestDTO = {
      name,
      email,
      password,
      role,
      schoolId: schoolId || null,
    };

    // Execute use case via controller
    const controller = container.authController;
    const result = await controller.signup(signupRequest);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: result.message, data: result.data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
