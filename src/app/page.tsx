import Link from "next/link";

export default function HomePage() {
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            {/* ── Nav ─────────────────────────────────────────────────── */}
            <nav style={{
                borderBottom: "1px solid var(--border)",
                background: "var(--surface)",
                position: "sticky",
                top: 0,
                zIndex: 50,
                boxShadow: "var(--shadow-xs)"
            }}>
                <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: 64 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 24 }}>🌱</span>
                        <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: "1.125rem", letterSpacing: "-0.02em" }}>
                            Tanindo Seeds
                        </span>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
                        <Link href="/register" className="btn btn-primary btn-sm">Register Business</Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ─────────────────────────────────────────────────── */}
            <section style={{
                background: "linear-gradient(135deg, var(--forest-deep) 0%, var(--primary) 60%, var(--primary-light) 100%)",
                color: "#fff",
                padding: "100px 0 96px",
                position: "relative",
                overflow: "hidden",
            }}>
                <div style={{
                    position: "absolute", inset: 0,
                    background: "radial-gradient(ellipse at 70% 50%, rgba(44,106,79,0.3) 0%, transparent 60%)",
                    pointerEvents: "none",
                }} />
                <div className="container" style={{ position: "relative" }}>
                    <div style={{ maxWidth: 680 }}>
                        <div className="badge badge-earth" style={{ marginBottom: 20 }}>
                            🇮🇳 India&apos;s B2B Seed Network
                        </div>
                        <h1 className="heading-xl" style={{ color: "#fff", marginBottom: 24 }}>
                            Certified Seeds.<br />
                            Direct to Businesses.
                        </h1>
                        <p style={{ fontSize: "1.125rem", opacity: 0.85, lineHeight: 1.7, marginBottom: 40, maxWidth: 520 }}>
                            Join India&apos;s most trusted B2B seed distribution platform. Verified sellers,
                            KYC-backed buyers, and real-time order management — all in one place.
                        </p>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                            <Link href="/register" className="btn btn-xl" style={{ background: "#fff", color: "var(--primary)" }}>
                                Register Business →
                            </Link>
                            <Link href="/login" className="btn btn-xl btn-outline" style={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}>
                                Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Trust Bar ────────────────────────────────────────────── */}
            <section style={{ background: "var(--earth-subtle)", borderTop: "1px solid var(--earth-border)", borderBottom: "1px solid var(--earth-border)", padding: "28px 0" }}>
                <div className="container">
                    <div style={{ display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
                        {[
                            { icon: "✓", text: "GST & PAN Verified Buyers" },
                            { icon: "🔒", text: "KYC-Gated Marketplace" },
                            { icon: "📦", text: "Real-time Order Tracking" },
                            { icon: "🌾", text: "Certified Seed Varieties" },
                        ].map(({ icon, text }) => (
                            <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--earth)", fontWeight: 600, fontSize: "0.875rem" }}>
                                <span>{icon}</span> {text}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ─────────────────────────────────────────────── */}
            <section className="section">
                <div className="container">
                    <div style={{ textAlign: "center", marginBottom: 60 }}>
                        <div className="label" style={{ marginBottom: 12 }}>Platform Features</div>
                        <h2 className="heading-lg" style={{ color: "var(--primary)" }}>Built for B2B Agriculture</h2>
                        <p className="caption" style={{ marginTop: 12, maxWidth: 480, margin: "12px auto 0" }}>
                            A complete workflow from business onboarding to order fulfilment.
                        </p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
                        {[
                            { icon: "🔐", title: "KYC Onboarding", desc: "Multi-step business verification with GST, PAN, and document upload. Admins approve before marketplace access." },
                            { icon: "🌾", title: "Certified Seed Catalog", desc: "Browse crops by variety, germination rate, purity, and lot number. Transparent specifications you can trust." },
                            { icon: "📋", title: "Order Management", desc: "Place orders with quantity selection. Track status from pending → approved → shipped → delivered." },
                            { icon: "📊", title: "Admin Analytics", desc: "Revenue metrics, pending KYC queue, low-stock alerts, and order pipeline — all in a single dashboard." },
                            { icon: "🛡️", title: "Role-Based Access", desc: "Admin and buyer roles with middleware-enforced route protection. No KYC, no access — enforced server-side." },
                            { icon: "⚡", title: "Real-time Updates", desc: "Instant order status updates, KYC decisions with rejection reasons, and live inventory tracking." },
                        ].map(({ icon, title, desc }) => (
                            <div key={title} className="card card-body" style={{ boxShadow: "var(--shadow-sm)" }}>
                                <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>
                                <h3 className="heading-sm" style={{ marginBottom: 8, color: "var(--primary)" }}>{title}</h3>
                                <p className="caption" style={{ lineHeight: 1.65 }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works ─────────────────────────────────────────── */}
            <section className="section-sm" style={{ background: "var(--surface)" }}>
                <div className="container">
                    <div style={{ textAlign: "center", marginBottom: 48 }}>
                        <div className="label" style={{ marginBottom: 12 }}>Process</div>
                        <h2 className="heading-lg" style={{ color: "var(--primary)" }}>How It Works</h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
                        {[
                            { step: "01", title: "Register", desc: "Fill business details, GST, PAN, and upload your GST certificate." },
                            { step: "02", title: "KYC Approval", desc: "Admin reviews your application within 1-2 business days." },
                            { step: "03", title: "Browse & Order", desc: "Access the full product catalog and place orders." },
                            { step: "04", title: "Delivery", desc: "Track your order through the full fulfilment pipeline." },
                        ].map(({ step, title, desc }) => (
                            <div key={step} style={{ textAlign: "center" }}>
                                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--primary-subtle)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem", fontWeight: 800, margin: "0 auto 16px" }}>
                                    {step}
                                </div>
                                <h4 style={{ fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>{title}</h4>
                                <p className="caption">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────────────────── */}
            <section className="section-sm" style={{ background: "var(--primary)", color: "#fff", textAlign: "center" }}>
                <div className="container">
                    <h2 className="heading-lg" style={{ color: "#fff", marginBottom: 16 }}>Ready to Join?</h2>
                    <p style={{ opacity: 0.8, marginBottom: 32 }}>Register today and start ordering certified seeds for your distribution network.</p>
                    <Link href="/register" className="btn btn-xl" style={{ background: "#fff", color: "var(--primary)" }}>
                        Get Started — It&apos;s Free
                    </Link>
                </div>
            </section>

            {/* ── Footer ───────────────────────────────────────────────── */}
            <footer style={{ background: "var(--forest-deep)", color: "rgba(255,255,255,0.6)", padding: "40px 0", textAlign: "center" }}>
                <div className="container">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
                        <span style={{ fontSize: 20 }}>🌱</span>
                        <span style={{ color: "#fff", fontWeight: 700 }}>Tanindo Seeds Pvt. Ltd.</span>
                    </div>
                    <p style={{ fontSize: "0.8125rem" }}>
                        &copy; {new Date().getFullYear()} Tanindo Seeds Pvt. Ltd. All rights reserved. &nbsp;·&nbsp; B2B Portal v2.0
                    </p>
                </div>
            </footer>
        </div>
    );
}
