// POST /api/login — public login alias (mirrors /api/auth/login)
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
            include: { distributor: { select: { approvalStatus: true } } },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        const token = await signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            kycStatus: user.distributor?.approvalStatus ?? "approved",
        });

        const res = NextResponse.json({
            success: true,
            role: user.role,
            approvalStatus: user.distributor?.approvalStatus ?? null,
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
        console.error("[/api/login]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
