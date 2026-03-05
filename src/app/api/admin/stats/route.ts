import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/stats — all analytics in one call (protected by middleware)
export async function GET() {
    try {
        const [
            totalUsers,
            approvedDistributors,
            pendingDistributors,
            totalProducts,
            totalOrders,
            pendingOrders,
        ] = await Promise.all([
            prisma.user.count({ where: { role: "distributor" } }),
            prisma.distributor.count({ where: { approvalStatus: "approved" } }),
            prisma.distributor.count({ where: { approvalStatus: "pending" } }),
            prisma.product.count({ where: { isActive: true } }),
            prisma.order.count(),
            prisma.order.count({ where: { status: "pending" } }),
        ]);

        // Revenue — use totalAmount field
        const revenueAgg = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { status: { in: ["processing", "shipped", "completed"] } },
        });

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyRevAgg = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                status: { in: ["processing", "shipped", "completed"] },
                createdAt: { gte: startOfMonth },
            },
        });

        // Recent orders
        const recentOrders = await prisma.order.findMany({
            take: 8,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        distributor: { select: { companyName: true } },
                    },
                },
                items: { include: { product: { select: { name: true, variety: true } } } },
            },
        });

        // Recent distributor applications
        const recentDistributors = await prisma.distributor.findMany({
            take: 8,
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                companyName: true,
                state: true,
                approvalStatus: true,
                updatedAt: true,
                user: { select: { email: true } },
            },
        });

        return NextResponse.json({
            totalUsers,
            approvedDistributors,
            pendingKyc: pendingDistributors,
            totalProducts,
            totalOrders,
            pendingOrders,
            totalRevenue: revenueAgg._sum.totalAmount ?? 0,
            thisMonthRevenue: monthlyRevAgg._sum.totalAmount ?? 0,
            recentOrders,
            recentKyc: recentDistributors,
        });
    } catch (err) {
        console.error("[admin/stats]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
