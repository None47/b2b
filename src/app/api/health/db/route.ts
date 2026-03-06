import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/health/db — liveness check for DB connectivity
export async function GET() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return NextResponse.json(
            { ok: true, database: "connected" },
            { headers: { "cache-control": "no-store" } }
        );
    } catch (err) {
        console.error("[health/db]", err);
        return NextResponse.json(
            { ok: false, database: "unreachable" },
            { status: 503, headers: { "cache-control": "no-store" } }
        );
    }
}
