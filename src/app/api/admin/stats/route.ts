import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toUiStatus(status: string): string {
    if (status === "processing") return "approved";
    if (status === "completed") return "delivered";
    return status;
}

// GET /api/admin/stats — all analytics in one call (protected by middleware)
export async function GET() {
    try {
        const [
            totalUsers,
            approvedBusinesses,
            pendingBusinesses,
            totalProducts,
            totalOrders,
            pendingOrders,
        ] = await Promise.all([
            prisma.user.count({ where: { role: { in: ["business", "distributor"] } } }),
            prisma.business.count({ where: { approvalStatus: "approved" } }),
            prisma.business.count({ where: { approvalStatus: "pending" } }),
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
                        business: { select: { companyName: true } },
                    },
                },
                items: { include: { product: { select: { name: true, variety: true } } } },
            },
        });

        // Recent business applications
        const recentBusinesses = await prisma.business.findMany({
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

        const normalizedRecentOrders = recentOrders.map((order) => ({
            ...order,
            status: toUiStatus(order.status),
            total: order.totalAmount,
            user: {
                companyName: order.user.business?.companyName ?? order.user.name ?? order.user.email,
                email: order.user.email,
            },
        }));

        const normalizedRecentBusinesses = recentBusinesses.map((business) => ({
            ...business,
            email: business.user.email,
            kycStatus: business.approvalStatus,
        }));

        return NextResponse.json({
            totalUsers,
            approvedBusinesses,
            approvedDistributors: approvedBusinesses,
            pendingKyc: pendingBusinesses,
            totalProducts,
            totalOrders,
            pendingOrders,
            totalRevenue: revenueAgg._sum.totalAmount ?? 0,
            thisMonthRevenue: monthlyRevAgg._sum.totalAmount ?? 0,
            recentOrders: normalizedRecentOrders,
            recentKyc: normalizedRecentBusinesses,
        });
    } catch (err) {
        console.error("[admin/stats]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
