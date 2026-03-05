import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            companyName, email, gstNumber, panNumber, phone,
            password, state, district, pincode, address, gstCertUrl,
        } = body;

        if (!email || !password || !companyName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (existing) {
            return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
        }

        const hashed = await bcrypt.hash(password, 12);

        // Create User + linked Distributor record in one transaction
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase().trim(),
                password: hashed,
                role: "distributor",
                distributor: {
                    create: {
                        companyName: companyName.trim(),
                        address: (address ?? "").trim(),
                        phone: (phone ?? "").trim(),
                        state: state?.trim(),
                        district: district?.trim(),
                        pincode: pincode?.trim(),
                        gstNumber: gstNumber?.toUpperCase().trim(),
                        panNumber: panNumber?.toUpperCase().trim(),
                        gstCertUrl: gstCertUrl?.trim(),
                        approvalStatus: "pending",
                    },
                },
            },
            include: { distributor: { select: { approvalStatus: true } } },
        });

        const token = await signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            kycStatus: user.distributor?.approvalStatus ?? "pending",
        });

        const res = NextResponse.json({ success: true, kycStatus: "pending" }, { status: 201 });
        res.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });
        return res;
    } catch (err) {
        console.error("[auth/register]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
