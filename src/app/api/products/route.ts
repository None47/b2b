import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// GET /api/products — list active products (KYC-gated via middleware)
export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(products);
    } catch (err) {
        console.error("[products GET]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/products — create product (admin only, checked server-side)
export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const user = token ? await verifyToken(token) : null;
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { name, crop, variety, description, germinationRate, purity, batchNumber, testingDate, stock, price, moq, gstRate } = body;

        if (!name || !crop || !variety || !batchNumber || !testingDate || !price || !stock) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name: name.trim(),
                crop: crop.trim(),
                variety: variety.trim(),
                description: description?.trim(),
                germinationRate: Number(germinationRate) || 92,
                purity: Number(purity) || 98,
                batchNumber: batchNumber.trim(),
                testingDate: testingDate.trim(),
                stock: Number(stock),
                price: Number(price),
                moq: Number(moq) || 100,
                gstRate: Number(gstRate) || 0,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (err) {
        console.error("[products POST]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
