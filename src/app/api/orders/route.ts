import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

function toUiStatus(status: string): string {
    if (status === "processing") return "approved";
    if (status === "completed") return "delivered";
    return status;
}

// GET /api/orders — business's own orders, or all orders for admin
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const user = token ? await verifyToken(token) : null;
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const orders = await prisma.order.findMany({
            where: user.role === "admin" ? {} : { userId: user.userId },
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        business: { select: { companyName: true, approvalStatus: true } },
                    },
                },
                items: {
                    include: {
                        product: { select: { name: true, variety: true, crop: true, category: true } },
                    },
                },
            },
        });

        const normalized = orders.map((order) => ({
            ...order,
            status: toUiStatus(order.status),
            total: order.totalAmount,
            user: {
                ...order.user,
                companyName: order.user.business?.companyName ?? order.user.name ?? order.user.email,
            },
        }));

        return NextResponse.json(normalized);
    } catch (err) {
        console.error("[orders GET]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/orders — place a new order
export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const user = token ? await verifyToken(token) : null;
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check business is approved
        if (user.role === "distributor" || user.role === "business") {
            const business = await prisma.business.findUnique({
                where: { userId: user.userId },
                select: { approvalStatus: true },
            });
            if (!business || business.approvalStatus !== "approved") {
                return NextResponse.json({ error: "Business approval required to place orders" }, { status: 403 });
            }
        }

        const { items, notes } = await req.json();
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 });
        }

        // Fetch product prices server-side (never trust client prices)
        const productIds = items.map((i: { productId: string }) => i.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds }, isActive: true },
        });

        let totalAmount = 0;
        const orderItemData: { productId: string; quantity: number; price: number }[] = [];

        for (const item of items) {
            const product = products.find((p) => p.id === item.productId);
            if (!product) {
                return NextResponse.json({ error: `Product ${item.productId} not found or inactive` }, { status: 400 });
            }
            if (item.quantity < product.moq) {
                return NextResponse.json(
                    { error: `Minimum order quantity for ${product.name} is ${product.moq} kg` },
                    { status: 400 }
                );
            }
            if (item.quantity > product.stock) {
                return NextResponse.json(
                    { error: `Insufficient stock for ${product.name} (available: ${product.stock})` },
                    { status: 400 }
                );
            }
            totalAmount += product.price * item.quantity;
            orderItemData.push({ productId: item.productId, quantity: item.quantity, price: product.price });
        }

        const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId: user.userId,
                totalAmount,
                status: "pending",
                notes: notes?.trim(),
                items: { create: orderItemData },
            },
            include: { items: { include: { product: { select: { name: true } } } } },
        });

        // Deduct stock
        await Promise.all(
            orderItemData.map((item) =>
                prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                })
            )
        );

        return NextResponse.json(
            {
                ...order,
                status: toUiStatus(order.status),
                total: order.totalAmount,
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("[orders POST]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
