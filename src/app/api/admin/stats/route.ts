import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/stats — all analytics in one call (protected by middleware)
export async function GET() {
    try {
        const [
            totalUsers,
            approvedDistributors,
            pendingKyc,
            totalProducts,
            totalOrders,
            pendingOrders,
        ] = await Promise.all([
            prisma.user.count({ where: { role: "buyer" } }),
            prisma.user.count({ where: { kycStatus: "approved" } }),
            prisma.user.count({ where: { kycStatus: "pending" } }),
            prisma.product.count({ where: { isActive: true } }),
            prisma.order.count(),
            prisma.order.count({ where: { status: "pending" } }),
        ]);

        // Revenue
        const revenueAgg = await prisma.order.aggregate({
            _sum: { total: true },
            where: { status: { in: ["approved", "shipped", "delivered"] } },
        });

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyRevAgg = await prisma.order.aggregate({
            _sum: { total: true },
            where: {
                status: { in: ["approved", "shipped", "delivered"] },
                createdAt: { gte: startOfMonth },
            },
        });

        // Recent orders
        const recentOrders = await prisma.order.findMany({
            take: 8,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { companyName: true, email: true } },
                items: { include: { product: { select: { name: true, variety: true } } } },
            },
        });

        // Recent KYC
        const recentKyc = await prisma.user.findMany({
            where: { role: "buyer" },
            take: 8,
            orderBy: { updatedAt: "desc" },
            select: { id: true, companyName: true, email: true, state: true, kycStatus: true, updatedAt: true },
        });

        return NextResponse.json({
            totalUsers,
            approvedDistributors,
            pendingKyc,
            totalProducts,
            totalOrders,
            pendingOrders,
            totalRevenue: revenueAgg._sum.total ?? 0,
            thisMonthRevenue: monthlyRevAgg._sum.total ?? 0,
            recentOrders,
            recentKyc,
        });
    } catch (err) {
        console.error("[admin/stats]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
