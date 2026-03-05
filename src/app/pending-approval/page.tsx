import Link from "next/link";

export default function PendingApprovalPage() {
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
            <nav style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: "var(--primary)", fontSize: "1.0625rem" }}>
                    <span>🌱</span> Tanindo Seeds
                </Link>
                <form action="/api/auth/logout" method="POST">
                    <button type="submit" className="btn btn-ghost btn-sm">Sign out</button>
                </form>
            </nav>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
                <div style={{ width: "100%", maxWidth: 520, textAlign: "center" }}>
                    <div style={{ fontSize: 64, marginBottom: 24 }}>⏳</div>
                    <h1 className="heading-md" style={{ marginBottom: 16, color: "var(--primary)" }}>Application Under Review</h1>
                    <p style={{ color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 32 }}>
                        Your distributor application is currently being reviewed by our team.
                        This typically takes <strong>1–2 business days</strong>. You will receive
                        an email notification once your KYC is approved.
                    </p>
                    <div className="card card-body" style={{ textAlign: "left", marginBottom: 24 }}>
                        <h3 style={{ fontWeight: 600, marginBottom: 12, color: "var(--text)" }}>What happens next?</h3>
                        <ol style={{ paddingLeft: 20, lineHeight: 2, color: "var(--text-muted)", fontSize: "0.9375rem" }}>
                            <li>Our team reviews your GST & PAN documents</li>
                            <li>You receive an approval or rejection email</li>
                            <li>Once approved, you can browse and order seeds</li>
                        </ol>
                    </div>
                    <Link href="/" className="btn btn-outline">← Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
