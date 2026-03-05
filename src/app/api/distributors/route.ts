import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// GET /api/distributors — list all distributors (admin only)
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
        console.error("[/api/distributors GET]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
