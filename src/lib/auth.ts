import { SignJWT, jwtVerify } from "jose";

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    kycStatus: string;
}

const getSecret = () =>
    new TextEncoder().encode(
        process.env.JWT_SECRET || "seedsco_fallback_jwt_secret_2024"
    );

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
