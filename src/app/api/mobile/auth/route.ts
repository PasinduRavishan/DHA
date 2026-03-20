import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

// POST /api/mobile/auth - Mobile sign in
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Check if user has a password set
        if (!user.password) {
            return NextResponse.json(
                { error: "Please set a password for your account" },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Create JWT token for mobile
        const token = sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: "30d" }
        );

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
                createdAt: user.createdAt,
            },
            token,
        });
    } catch (error) {
        console.error("Mobile auth error:", error);
        return NextResponse.json(
            { error: "Authentication failed. Please try again." },
            { status: 500 }
        );
    }
}
