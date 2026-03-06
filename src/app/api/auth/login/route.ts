import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            include: { business: { select: { approvalStatus: true } } },
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // For admins, kycStatus = "approved". For businesses read from Business record.
        const kycStatus = user.role === "admin"
            ? "approved"
            : (user.business?.approvalStatus ?? "pending");

        const token = await signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            kycStatus,
        });

        const res = NextResponse.json({
            success: true,
            role: user.role,
            kycStatus,
        });

        res.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });

        return res;
    } catch (err) {
        console.error("[auth/login]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
