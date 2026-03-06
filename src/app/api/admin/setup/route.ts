import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

// POST /api/admin/setup — create first admin user (protected by ADMIN_SETUP_SECRET)
export async function POST(req: NextRequest) {
    try {
        const { email, password, secret } = await req.json();
        const normalizedEmail = email?.toLowerCase().trim();
        const setupSecret = process.env.ADMIN_SETUP_SECRET;

        if (!setupSecret) {
            return NextResponse.json({ error: "ADMIN_SETUP_SECRET is not configured" }, { status: 500 });
        }
        if (secret !== setupSecret) {
            return NextResponse.json({ error: "Invalid setup secret" }, { status: 403 });
        }
        if (!email || !password) {
            return NextResponse.json({ error: "Email and password required" }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
            // Promote existing user to admin and ensure Admin profile exists
            const updated = await prisma.$transaction(async (tx) => {
                const promoted = await tx.user.update({
                    where: { email: normalizedEmail },
                    data: { role: "admin" },
                });
                await tx.admin.upsert({
                    where: { userId: promoted.id },
                    update: {},
                    create: { userId: promoted.id },
                });
                return promoted;
            });

            const token = await signToken({ userId: updated.id, email: updated.email, role: "admin" });
            const res = NextResponse.json({ success: true, message: "User promoted to admin" });
            res.cookies.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60, path: "/" });
            return res;
        }

        const hashed = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                password: hashed,
                role: "admin",
                admin: { create: {} },
            },
        });

        const token = await signToken({ userId: user.id, email: user.email, role: "admin" });
        const res = NextResponse.json({ success: true, message: "Admin created successfully" }, { status: 201 });
        res.cookies.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60, path: "/" });
        return res;
    } catch (err) {
        console.error("[admin/setup]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
