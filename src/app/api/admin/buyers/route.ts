import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/buyers — list all buyers with filters
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const kycStatus = searchParams.get("status");

        const buyers = await prisma.user.findMany({
            where: {
                role: "buyer",
                ...(kycStatus && kycStatus !== "all" ? { kycStatus } : {}),
            },
            orderBy: { createdAt: "desc" },
            select: {
                id: true, email: true, companyName: true, gstNumber: true, panNumber: true,
                state: true, district: true, pincode: true, phone: true,
                kycStatus: true, kycRejectionReason: true, createdAt: true, updatedAt: true,
            },
        });

        return NextResponse.json(buyers);
    } catch (err) {
        console.error("[admin/buyers GET]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/admin/buyers — approve or reject KYC
export async function PATCH(req: NextRequest) {
    try {
        const { buyerId, kycStatus, kycRejectionReason } = await req.json();

        if (!buyerId || !kycStatus) {
            return NextResponse.json({ error: "buyerId and kycStatus required" }, { status: 400 });
        }

        const allowed = ["approved", "rejected", "pending"];
        if (!allowed.includes(kycStatus)) {
            return NextResponse.json({ error: "Invalid kycStatus" }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id: buyerId },
            data: {
                kycStatus,
                kycRejectionReason: kycStatus === "rejected" ? kycRejectionReason : null,
            },
        });

        return NextResponse.json({ success: true, kycStatus: user.kycStatus });
    } catch (err) {
        console.error("[admin/buyers PATCH]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
