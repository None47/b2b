import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

function toUiStatus(status: string): string {
    if (status === "processing") return "approved";
    if (status === "completed") return "delivered";
    return status;
}

function toDbStatus(status: string): string | null {
    if (status === "approved") return "processing";
    if (status === "delivered") return "completed";
    if (["pending", "processing", "shipped", "completed", "cancelled"].includes(status)) return status;
    return null;
}

// GET /api/orders/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const user = token ? await verifyToken(token) : null;
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        business: { select: { companyName: true } },
                    },
                },
                items: { include: { product: true } },
            },
        });
        if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (user.role !== "admin" && order.userId !== user.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.json({
            ...order,
            status: toUiStatus(order.status),
            total: order.totalAmount,
            user: {
                ...order.user,
                companyName: order.user.business?.companyName ?? order.user.name ?? order.user.email,
            },
        });
    } catch (err) {
        console.error("[orders/[id] GET]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/orders/[id] — update status (admin only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const user = token ? await verifyToken(token) : null;
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const nextStatus = body.status ? toDbStatus(body.status) : null;
        if (body.status && !nextStatus) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const order = await prisma.order.update({
            where: { id },
            data: { ...(nextStatus ? { status: nextStatus } : {}) },
        });
        return NextResponse.json({
            ...order,
            status: toUiStatus(order.status),
            total: order.totalAmount,
        });
    } catch (err) {
        console.error("[orders/[id] PATCH]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
