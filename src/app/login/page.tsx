"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error || "Login failed");
            // Redirect based on role
            if (data.role === "admin") router.push("/admin");
            else if (data.kycStatus === "approved") router.push("/dashboard");
            else router.push("/pending-approval");
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
            <nav style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: "var(--primary)", fontSize: "1.0625rem" }}>
                    <span>🌱</span> Tanindo Seeds
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">Register</Link>
            </nav>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
                <div style={{ width: "100%", maxWidth: 420 }}>
                    <div style={{ textAlign: "center", marginBottom: 32 }}>
                        <span style={{ fontSize: 48 }}>🌱</span>
                        <h1 className="heading-md" style={{ marginTop: 12, color: "var(--primary)" }}>Welcome back</h1>
                        <p className="caption" style={{ marginTop: 6 }}>Sign in to your business account</p>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                {error && <div className="alert alert-danger">{error}</div>}
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        className="form-input"
                                        type="email"
                                        id="email"
                                        value={form.email}
                                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                        placeholder="you@company.com"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <input
                                        className="form-input"
                                        type="password"
                                        id="password"
                                        value={form.password}
                                        onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 4 }}>
                                    {loading ? <span className="spinner" /> : "Sign In →"}
                                </button>
                            </form>
                        </div>
                        <div className="card-footer" style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                            New business?{" "}
                            <Link href="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>Register here</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
