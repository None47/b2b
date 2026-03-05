import Link from "next/link";

export default function ForbiddenPage() {
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
            <div style={{ textAlign: "center", maxWidth: 420 }}>
                <div style={{ fontSize: 72, marginBottom: 24 }}>🚫</div>
                <h1 className="heading-md" style={{ color: "var(--danger)", marginBottom: 12 }}>Access Denied</h1>
                <p className="caption" style={{ marginBottom: 32 }}>
                    You don&apos;t have permission to access this page.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                    <Link href="/" className="btn btn-ghost">Home</Link>
                    <Link href="/dashboard" className="btn btn-primary">My Dashboard</Link>
                </div>
            </div>
        </div>
    );
}
