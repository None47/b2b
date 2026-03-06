import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// GET /api/admin/buyers — list users with their business profiles
export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const user = token ? await verifyToken(token) : null;
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status"); // pending | approved | rejected

        const businesses = await prisma.business.findMany({
            where: status && status !== "all" ? { approvalStatus: status } : {},
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { id: true, name: true, email: true, createdAt: true } },
            },
        });

        const normalized = businesses.map((business) => ({
            ...business,
            email: business.user.email,
            kycStatus: business.approvalStatus,
            kycRejectionReason: business.rejectionNote,
        }));

        return NextResponse.json(normalized);
    } catch (err) {
        console.error("[admin/buyers GET]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/admin/buyers — approve or reject business application
export async function PATCH(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const authUser = token ? await verifyToken(token) : null;
        if (!authUser || authUser.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const businessId = body.businessId ?? body.buyerId;
        const approvalStatus = body.approvalStatus ?? body.kycStatus;
        const rejectionNote = body.rejectionNote ?? body.kycRejectionReason;

        const allowed = ["approved", "rejected", "pending"];
        if (!businessId || !allowed.includes(approvalStatus)) {
            return NextResponse.json({ error: "businessId and valid approvalStatus required" }, { status: 400 });
        }

        const business = await prisma.business.update({
            where: { id: businessId },
            data: {
                approvalStatus,
                rejectionNote: approvalStatus === "rejected" ? rejectionNote : null,
            },
        });

        return NextResponse.json({
            success: true,
            approvalStatus: business.approvalStatus,
            kycStatus: business.approvalStatus,
        });
    } catch (err) {
        console.error("[admin/buyers PATCH]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
