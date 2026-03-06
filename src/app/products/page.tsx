"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
    id: string; name: string; crop: string; variety: string;
    description?: string; germinationRate: number; purity: number;
    batchNumber: string; testingDate: string; stock: number;
    price: number; moq: number; gstRate: number;
}

const CROPS = ["All", "Wheat", "Rice", "Cotton", "Vegetables", "Pulses", "Hybrid", "Other"];

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [cropFilter, setCropFilter] = useState("All");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/products");
            if (res.status === 401) { router.push("/login"); return; }
            if (res.status === 403) { router.push("/pending-approval"); return; }
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch {
            setProducts([]);
            setError("Failed to load products. Please refresh.");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => { load(); }, [load]);

    const fmt = (v: number) => `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

    const filtered = products.filter(p => {
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.variety.toLowerCase().includes(search.toLowerCase()) ||
            p.crop.toLowerCase().includes(search.toLowerCase());
        const matchCrop = cropFilter === "All" || p.crop.toLowerCase().includes(cropFilter.toLowerCase());
        return matchSearch && matchCrop;
    });

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            <nav style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "var(--shadow-xs)" }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: "var(--primary)", fontSize: "1.0625rem" }}>
                    <span>🌱</span> Tanindo Seeds
                </Link>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <Link href="/dashboard" className="btn btn-ghost btn-sm">My Orders</Link>
                    <button className="btn btn-ghost btn-sm" onClick={async () => {
                        await fetch("/api/auth/logout", { method: "POST" });
                        router.push("/");
                    }}>Sign out</button>
                </div>
            </nav>

            <div className="container" style={{ padding: "48px 28px" }}>
                <div style={{ marginBottom: 36 }}>
                    <h1 className="heading-md" style={{ color: "var(--primary)", marginBottom: 4 }}>Seed Catalog</h1>
                    <p className="caption">Browse certified seed varieties. All products are quality-tested and batch-tracked.</p>
                </div>
                {error && (
                    <div className="alert alert-danger" style={{ marginBottom: 16 }}>
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28, alignItems: "center" }}>
                    <input
                        className="form-input"
                        style={{ maxWidth: 280 }}
                        placeholder="Search by name, variety, or crop..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {CROPS.map(c => (
                            <button key={c} className={`btn btn-sm ${cropFilter === c ? "btn-primary" : "btn-outline"}`} onClick={() => setCropFilter(c)}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "80px", color: "var(--text-muted)" }}>
                        <span className="spinner-dark spinner" style={{ width: 32, height: 32 }} />
                        <p style={{ marginTop: 16 }}>Loading products...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px", color: "var(--text-muted)" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🌾</div>
                        <p>No products found matching your search.</p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                        {filtered.map(p => (
                            <div key={p.id} className="card" style={{ boxShadow: "var(--shadow-sm)", transition: "box-shadow 0.2s, transform 0.2s" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-lg)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}>
                                <div className="card-header">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                            <div className="label" style={{ marginBottom: 4 }}>{p.crop}</div>
                                            <h3 style={{ fontWeight: 700, color: "var(--text)", fontSize: "1.0625rem" }}>{p.name}</h3>
                                            <p className="caption">{p.variety}</p>
                                        </div>
                                        <span className="badge badge-olive">{p.crop}</span>
                                    </div>
                                </div>
                                <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                        {[
                                            ["Germination", `${p.germinationRate}%`],
                                            ["Purity", `${p.purity}%`],
                                            ["Stock", `${p.stock.toLocaleString()} kg`],
                                            ["MOQ", `${p.moq} kg`],
                                        ].map(([label, value]) => (
                                            <div key={label} style={{ background: "var(--surface-muted)", borderRadius: "var(--radius-sm)", padding: "8px 10px" }}>
                                                <div className="caption">{label}</div>
                                                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)" }}>{value}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="divider" style={{ margin: "4px 0" }} />
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)" }}>{fmt(p.price)}<span className="caption" style={{ fontSize: "0.75rem" }}>/kg</span></div>
                                            {p.gstRate > 0 && <div className="caption">+ {p.gstRate}% GST</div>}
                                        </div>
                                        <Link href={`/products/${p.id}`} className="btn btn-primary btn-sm">Order Now →</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
