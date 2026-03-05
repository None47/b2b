import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// PUT /api/products/[id] — update stock or details (admin)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const user = token ? await verifyToken(token) : null;
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const { id } = await params;
        const body = await req.json();
        const product = await prisma.product.update({
            where: { id },
            data: {
                ...(body.stock !== undefined ? { stock: Number(body.stock) } : {}),
                ...(body.price !== undefined ? { price: Number(body.price) } : {}),
                ...(body.name ? { name: body.name } : {}),
                ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
            },
        });
        return NextResponse.json(product);
    } catch (err) {
        console.error("[products/[id] PUT]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/products/[id] — deactivate product (admin)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const user = token ? await verifyToken(token) : null;
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const { id } = await params;
        await prisma.product.update({ where: { id }, data: { isActive: false } });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[products/[id] DELETE]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET /api/products/[id] — single product detail
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(product);
    } catch (err) {
        console.error("[products/[id] GET]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
