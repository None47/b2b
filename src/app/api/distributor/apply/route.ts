import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// POST /api/distributor/apply
// Called at Step 3 of registration — updates the existing Distributor record
// with full business details (address, docs) after the user account was created in Step 1.
export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;
        const authUser = token ? await verifyToken(token) : null;
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized — please complete Step 1 first" }, { status: 401 });
        }

        const {
            companyName, gstNumber, panNumber, phone,
            state, district, pincode, address, gstCertUrl,
        } = await req.json();

        if (!companyName || !address || !state || !pincode) {
            return NextResponse.json({ error: "Company name, address, state and pincode are required" }, { status: 400 });
        }

        // Upsert: create or update the Distributor record linked to the authenticated user
        const distributor = await prisma.distributor.upsert({
            where: { userId: authUser.userId },
            create: {
                userId: authUser.userId,
                companyName: companyName.trim(),
                address: address.trim(),
                phone: (phone ?? "").trim(),
                state: state?.trim(),
                district: district?.trim(),
                pincode: pincode?.trim(),
                gstNumber: gstNumber?.toUpperCase().trim(),
                panNumber: panNumber?.toUpperCase().trim(),
                gstCertUrl: gstCertUrl?.trim(),
                approvalStatus: "pending",
            },
            update: {
                companyName: companyName.trim(),
                address: address.trim(),
                phone: (phone ?? "").trim(),
                state: state?.trim(),
                district: district?.trim(),
                pincode: pincode?.trim(),
                gstNumber: gstNumber?.toUpperCase().trim(),
                panNumber: panNumber?.toUpperCase().trim(),
                gstCertUrl: gstCertUrl?.trim(),
                approvalStatus: "pending",
            },
        });

        return NextResponse.json({
            success: true,
            approvalStatus: distributor.approvalStatus,
            message: "Distributor application submitted. Awaiting admin review.",
        });
    } catch (err) {
        console.error("[/api/distributor/apply]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
