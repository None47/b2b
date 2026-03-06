import { SignJWT, jwtVerify } from "jose";

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    kycStatus?: string;
}

const getSecret = () =>
    new TextEncoder().encode(getJwtSecret());

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not set");
    }
    return secret;
}

export async function signToken(payload: TokenPayload): Promise<string> {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(getSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return payload as unknown as TokenPayload;
    } catch {
        return null;
    }
}
