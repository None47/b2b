import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// POST /api/admin/approve-distributor
// Body: { distributorId: string, action: "approve" | "reject", reason?: string }
export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const user = token ? await verifyToken(token) : null;
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { distributorId, action, reason } = await req.json();

        if (!distributorId || !action) {
            return NextResponse.json({ error: "distributorId and action are required" }, { status: 400 });
        }
        if (!["approve", "reject"].includes(action)) {
            return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
        }

        const approvalStatus = action === "approve" ? "approved" : "rejected";

        const distributor = await prisma.distributor.update({
            where: { id: distributorId },
            data: {
                approvalStatus,
                rejectionNote: action === "reject" && reason ? reason : null,
            },
            include: {
                user: { select: { email: true, name: true } },
            },
        });

        return NextResponse.json({
            success: true,
            distributorId: distributor.id,
            approvalStatus: distributor.approvalStatus,
            companyName: distributor.companyName,
        });
    } catch (err) {
        console.error("[/api/admin/approve-distributor]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
