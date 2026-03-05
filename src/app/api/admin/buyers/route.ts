import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// GET /api/admin/buyers — list users with their distributor profiles
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

        const distributors = await prisma.distributor.findMany({
            where: status && status !== "all" ? { approvalStatus: status } : {},
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { id: true, name: true, email: true, createdAt: true } },
            },
        });

        return NextResponse.json(distributors);
    } catch (err) {
        console.error("[admin/buyers GET]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/admin/buyers — approve or reject distributor application
export async function PATCH(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const authUser = token ? await verifyToken(token) : null;
        if (!authUser || authUser.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { distributorId, approvalStatus, rejectionNote } = await req.json();

        const allowed = ["approved", "rejected", "pending"];
        if (!distributorId || !allowed.includes(approvalStatus)) {
            return NextResponse.json({ error: "distributorId and valid approvalStatus required" }, { status: 400 });
        }

        const distributor = await prisma.distributor.update({
            where: { id: distributorId },
            data: {
                approvalStatus,
                rejectionNote: approvalStatus === "rejected" ? rejectionNote : null,
            },
        });

        return NextResponse.json({ success: true, approvalStatus: distributor.approvalStatus });
    } catch (err) {
        console.error("[admin/buyers PATCH]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
