import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_ROUTES = ["/admin", "/api/admin"];
const BUYER_ROUTES = ["/dashboard"];
const PRODUCT_ROUTES = ["/products", "/api/products"];
const ORDER_ROUTES = ["/api/orders"];
const AUTH_ROUTES = ["/login", "/register"];

// Public API routes — never block these
const PUBLIC_API = [
    "/api/auth/register",
    "/api/auth/login",
    "/api/auth/logout",
    "/api/register",
    "/api/login",
    "/api/admin/setup",
];

const getSecret = () =>
    new TextEncoder().encode(getJwtSecret());

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not set");
    }
    return secret;
}

interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    kycStatus: string; // holds approvalStatus for businesses
}

async function decodeToken(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return payload as unknown as TokenPayload;
    } catch {
        return null;
    }
}

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get("auth_token")?.value;
    const user = token ? await decodeToken(token) : null;
    const isApi = pathname.startsWith("/api/");

    // Never block public API routes
    if (PUBLIC_API.some((r) => pathname.startsWith(r))) {
        return NextResponse.next();
    }

    // 1. Admin routes — must be admin
    if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
        if (!user) {
            return isApi
                ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
                : NextResponse.redirect(new URL("/login?redirect=" + encodeURIComponent(pathname), req.url));
        }
        if (user.role !== "admin") {
            return isApi
                ? NextResponse.json({ error: "Forbidden" }, { status: 403 })
                : NextResponse.redirect(new URL("/403", req.url));
        }
        return NextResponse.next();
    }

    // 2. Business dashboard routes — must be authenticated + approved
    if (BUYER_ROUTES.some((r) => pathname.startsWith(r))) {
        if (!user) {
            return NextResponse.redirect(new URL("/login?redirect=" + encodeURIComponent(pathname), req.url));
        }
        if (user.role !== "admin" && user.kycStatus !== "approved") {
            return NextResponse.redirect(new URL("/pending-approval", req.url));
        }
        return NextResponse.next();
    }

    // 3. Order routes — must be authenticated
    if (ORDER_ROUTES.some((r) => pathname.startsWith(r))) {
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        return NextResponse.next();
    }

    // 4. Product routes — approval gate for businesses
    if (PRODUCT_ROUTES.some((r) => pathname.startsWith(r))) {
        if (!user) {
            return isApi
                ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
                : NextResponse.redirect(new URL("/login?redirect=" + encodeURIComponent(pathname), req.url));
        }
        if (user?.role === "admin") return NextResponse.next();
        // kycStatus in token holds approvalStatus for businesses
        if (user.kycStatus !== "approved") {
            return isApi
                ? NextResponse.json({ error: "Business approval required" }, { status: 403 })
                : NextResponse.redirect(new URL("/pending-approval", req.url));
        }
        return NextResponse.next();
    }

    // 5. Auth pages — redirect already-authenticated users
    if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && user) {
        const home = user.role === "admin" ? "/admin" : (user.kycStatus === "approved" ? "/dashboard" : "/pending-approval");
        return NextResponse.redirect(new URL(home, req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/api/admin/:path*",
        "/dashboard/:path*",
        "/api/orders/:path*",
        "/products/:path*",
        "/api/products/:path*",
        "/login",
        "/register",
    ],
};
