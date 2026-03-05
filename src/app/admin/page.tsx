"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Stats {
    totalUsers: number; approvedDistributors: number; pendingKyc: number;
    totalProducts: number; totalOrders: number; pendingOrders: number;
    totalRevenue: number; thisMonthRevenue: number;
    recentOrders: {
        id: string; orderNumber: string; status: string; total: number; createdAt: string;
        user: { companyName: string; email: string };
        items: { product: { name: string; variety: string } }[];
    }[];
    recentKyc: { id: string; companyName: string; email: string; state: string; kycStatus: string; updatedAt: string }[];
}

interface Buyer {
    id: string; email: string; companyName: string; gstNumber: string; panNumber: string;
    state: string; district: string; phone: string; kycStatus: string; kycRejectionReason?: string; createdAt: string;
}

interface Order {
    id: string; orderNumber: string; status: string; total: number; createdAt: string;
    user: { companyName: string; email: string };
    items: { quantity: number; product: { name: string; variety: string } }[];
}

interface Product {
    id: string; name: string; crop: string; variety: string; stock: number; moq: number; isActive: boolean; price: number; batchNumber: string;
}

type Tab = "overview" | "kyc" | "orders" | "products";

const STATUS_BADGE: Record<string, string> = {
    pending: "badge-yellow", approved: "badge-green",
    shipped: "badge-blue", delivered: "badge-green", cancelled: "badge-red", rejected: "badge-red",
};

const TABS: { key: Tab; icon: string; label: string; countKey?: keyof Stats }[] = [
    { key: "overview", icon: "◈", label: "Overview" },
    { key: "kyc", icon: "✦", label: "KYC", countKey: "pendingKyc" },
    { key: "orders", icon: "◎", label: "Orders", countKey: "pendingOrders" },
    { key: "products", icon: "🌾", label: "Products" },
];

export default function AdminDashboard() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("overview");
    const [stats, setStats] = useState<Stats | null>(null);
    const [buyers, setBuyers] = useState<Buyer[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ msg: string; type?: "success" | "error" } | null>(null);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [kycFilter, setKycFilter] = useState("all");

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const loadAll = useCallback(async () => {
        setLoading(true);
        const [s, b, o, p] = await Promise.all([
            fetch("/api/admin/stats").then(r => r.json()),
            fetch("/api/admin/buyers").then(r => r.json()),
            fetch("/api/orders").then(r => r.json()),
            fetch("/api/products").then(r => r.json()),
        ]);
        setStats(s); setBuyers(Array.isArray(b) ? b : []);
        setOrders(Array.isArray(o) ? o : []); setProducts(Array.isArray(p) ? p : []);
        setLoading(false);
    }, []);

    useEffect(() => {
        const token = document.cookie.includes("auth_token");
        if (!token) { router.push("/login"); return; }
        loadAll();
    }, [loadAll, router]);

    const updateKyc = async (buyerId: string, kycStatus: string, reason?: string) => {
        const r = await fetch("/api/admin/buyers", {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buyerId, kycStatus, kycRejectionReason: reason }),
        });
        if (r.ok) { showToast(`KYC ${kycStatus}`); setBuyers(prev => prev.map(b => b.id === buyerId ? { ...b, kycStatus } : b)); }
        else showToast("Failed", "error");
    };

    const updateOrder = async (orderId: string, status: string) => {
        const r = await fetch(`/api/orders/${orderId}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
        });
        if (r.ok) { showToast("Order updated"); setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o)); }
        else showToast("Failed", "error");
    };

    const fmt = (v: number) => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
    const fmtD = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const filteredBuyers = buyers.filter(b => kycFilter === "all" || b.kycStatus === kycFilter);

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, background: "var(--bg)" }}>
            <span className="spinner-dark spinner" style={{ width: 36, height: 36 }} />
            <p className="caption">Loading dashboard…</p>
        </div>
    );

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
            {/* ── Sidebar ──────────────────────────────────────────────── */}
            <aside style={{ width: 220, background: "var(--forest-deep)", display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0 }}>
                <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff", fontWeight: 800, fontSize: "1rem" }}>
                        <span>🌱</span> Tanindo Seeds
                    </Link>
                    <div style={{ marginTop: 6, fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Admin Portal</div>
                </div>
                <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
                    {TABS.map(t => {
                        const count = t.countKey && stats ? (stats[t.countKey] as number) : null;
                        const active = tab === t.key;
                        return (
                            <button key={t.key} onClick={() => setTab(t.key)} style={{
                                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: "var(--radius-md)",
                                background: active ? "rgba(255,255,255,0.12)" : "transparent",
                                color: active ? "#fff" : "rgba(255,255,255,0.6)",
                                border: "none", cursor: "pointer", textAlign: "left", fontSize: "0.875rem", fontWeight: active ? 600 : 400,
                                transition: "all 0.15s",
                            }}>
                                <span>{t.icon}</span> <span style={{ flex: 1 }}>{t.label}</span>
                                {count !== null && count > 0 && <span style={{ background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: "0.6875rem", fontWeight: 700, padding: "2px 7px" }}>{count}</span>}
                            </button>
                        );
                    })}
                </nav>
                <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); }} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: "var(--radius-md)",
                        color: "rgba(255,255,255,0.5)", background: "transparent", border: "none", cursor: "pointer", fontSize: "0.875rem", width: "100%",
                    }}>→ Sign out</button>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────────── */}
            <div style={{ marginLeft: 220, flex: 1, padding: "32px 36px", minHeight: "100vh" }}>
                {/* Toast */}
                {toast && (
                    <div style={{
                        position: "fixed", top: 20, right: 24, zIndex: 1000, padding: "12px 20px",
                        borderRadius: "var(--radius-md)", fontWeight: 600, fontSize: "0.875rem",
                        background: toast.type === "error" ? "var(--danger)" : "var(--primary)", color: "#fff",
                        boxShadow: "var(--shadow-lg)", animation: "none",
                    }}>{toast.msg}</div>
                )}

                {/* ── OVERVIEW ──────────────────────────────────────────── */}
                {tab === "overview" && stats && (
                    <div>
                        <div style={{ marginBottom: 32 }}>
                            <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: "var(--text)" }}>Dashboard Overview</h1>
                            <p className="caption">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 36 }}>
                            {[
                                { label: "Total Revenue", value: fmt(stats.totalRevenue), icon: "₹", sub: `${fmt(stats.thisMonthRevenue)} this month`, accent: true },
                                { label: "Total Orders", value: stats.totalOrders, icon: "◎", sub: `${stats.pendingOrders} pending` },
                                { label: "Pending KYC", value: stats.pendingKyc, icon: "✦", sub: "Awaiting review", alert: stats.pendingKyc > 0 },
                                { label: "Registered Buyers", value: stats.totalUsers, icon: "👥", sub: `${stats.approvedDistributors} approved` },
                                { label: "Active Products", value: stats.totalProducts, icon: "🌾", sub: "In catalog" },
                            ].map(s => (
                                <div key={s.label} className="card card-body" style={{ boxShadow: "var(--shadow-sm)", ...(s.accent ? { borderColor: "var(--earth-border)", background: "var(--earth-subtle)" } : {}) }}>
                                    <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                                    <div style={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1, color: s.alert ? "var(--danger)" : "var(--primary)" }}>{s.value}</div>
                                    <div style={{ fontWeight: 600, fontSize: "0.875rem", marginTop: 4, color: "var(--text)" }}>{s.label}</div>
                                    <div className="caption" style={{ marginTop: 2 }}>{s.sub}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                            {/* Recent Orders */}
                            <div>
                                <h2 style={{ fontWeight: 700, marginBottom: 12, fontSize: "1rem" }}>Recent Orders</h2>
                                <div className="table-wrap">
                                    <table>
                                        <thead><tr><th>Order #</th><th>Buyer</th><th>Total</th><th>Status</th></tr></thead>
                                        <tbody>
                                            {stats.recentOrders.map(o => (
                                                <tr key={o.id}>
                                                    <td><code style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{o.orderNumber}</code></td>
                                                    <td><div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{o.user.companyName}</div></td>
                                                    <td><strong>{fmt(o.total)}</strong></td>
                                                    <td><span className={`badge ${STATUS_BADGE[o.status] || "badge-gray"}`}>{o.status}</span></td>
                                                </tr>
                                            ))}
                                            {!stats.recentOrders.length && <tr><td colSpan={4} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No orders yet</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* Recent KYC */}
                            <div>
                                <h2 style={{ fontWeight: 700, marginBottom: 12, fontSize: "1rem" }}>Recent KYC Activity</h2>
                                <div className="table-wrap">
                                    <table>
                                        <thead><tr><th>Company</th><th>State</th><th>Status</th></tr></thead>
                                        <tbody>
                                            {stats.recentKyc.map(k => (
                                                <tr key={k.id}>
                                                    <td><div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{k.companyName || "—"}</div><div className="caption">{k.email}</div></td>
                                                    <td>{k.state || "—"}</td>
                                                    <td><span className={`badge ${STATUS_BADGE[k.kycStatus] || "badge-gray"}`}>{k.kycStatus}</span></td>
                                                </tr>
                                            ))}
                                            {!stats.recentKyc.length && <tr><td colSpan={3} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No KYC activity</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── KYC ───────────────────────────────────────────────── */}
                {tab === "kyc" && (
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                            <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: "var(--text)" }}>KYC Approvals</h1>
                            <div style={{ display: "flex", gap: 8 }}>
                                {["all", "pending", "approved", "rejected"].map(f => (
                                    <button key={f} className={`btn btn-sm ${kycFilter === f ? "btn-primary" : "btn-outline"}`} onClick={() => setKycFilter(f)}>
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                            {filteredBuyers.map(b => (
                                <div key={b.id} className="card" style={{ boxShadow: "var(--shadow-sm)" }}>
                                    <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: "var(--text)" }}>{b.companyName}</div>
                                            <div className="caption">{b.email}</div>
                                        </div>
                                        <span className={`badge ${STATUS_BADGE[b.kycStatus] || "badge-gray"}`}>{b.kycStatus}</span>
                                    </div>
                                    <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                        {[["GST", b.gstNumber], ["PAN", b.panNumber], ["State", b.state], ["District", b.district], ["Phone", b.phone], ["Applied", fmtD(b.createdAt)]].map(([l, v]) => (
                                            <div key={String(l)}>
                                                <div className="caption">{l}</div>
                                                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)" }}>{v || "—"}</div>
                                            </div>
                                        ))}
                                        {b.kycRejectionReason && <div style={{ gridColumn: "span 2", color: "var(--danger)", fontSize: "0.8125rem" }}>Reason: {b.kycRejectionReason}</div>}
                                    </div>
                                    {b.kycStatus === "pending" && (
                                        <div className="card-footer" style={{ display: "flex", gap: 8 }}>
                                            <button className="btn btn-sm btn-primary" onClick={() => updateKyc(b.id, "approved")}>Approve</button>
                                            <button className="btn btn-sm btn-ghost" style={{ color: "var(--danger)" }} onClick={() => {
                                                const r = prompt("Rejection reason:");
                                                if (r !== null) updateKyc(b.id, "rejected", r);
                                            }}>Reject</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {!filteredBuyers.length && <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--text-muted)" }}>No buyers with this status</div>}
                        </div>
                    </div>
                )}

                {/* ── ORDERS ────────────────────────────────────────────── */}
                {tab === "orders" && (
                    <div>
                        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: "var(--text)", marginBottom: 24 }}>Orders Management</h1>
                        <div className="table-wrap">
                            <table>
                                <thead><tr><th>Order #</th><th>Buyer</th><th>Products</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id}>
                                            <td><code style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>{o.orderNumber}</code></td>
                                            <td><div style={{ fontWeight: 600 }}>{o.user.companyName}</div><div className="caption">{o.user.email}</div></td>
                                            <td className="caption">{o.items.map(i => `${i.product.variety} ×${i.quantity}`).join(", ")}</td>
                                            <td><strong>{fmt(o.total)}</strong></td>
                                            <td>
                                                <select value={o.status} onChange={e => updateOrder(o.id, e.target.value)}
                                                    style={{ padding: "4px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: "0.8125rem", cursor: "pointer" }}>
                                                    {["pending", "approved", "shipped", "delivered", "cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </td>
                                            <td className="caption">{fmtD(o.createdAt)}</td>
                                        </tr>
                                    ))}
                                    {!orders.length && <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No orders yet</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── PRODUCTS ──────────────────────────────────────────── */}
                {tab === "products" && (
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                            <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: "var(--text)" }}>Products</h1>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowAddProduct(true)}>+ Add Product</button>
                        </div>
                        <div className="table-wrap">
                            <table>
                                <thead><tr><th>Name</th><th>Crop</th><th>Price</th><th>Stock</th><th>MOQ</th><th>Batch</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id}>
                                            <td><div style={{ fontWeight: 600 }}>{p.name}</div><div className="caption">{p.variety}</div></td>
                                            <td><span className="badge badge-olive">{p.crop}</span></td>
                                            <td>₹{p.price}/kg</td>
                                            <td style={{ color: p.stock < 100 ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>{p.stock} kg {p.stock < 100 && "⚠️"}</td>
                                            <td>{p.moq} kg</td>
                                            <td><code style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{p.batchNumber}</code></td>
                                            <td><span className={`badge ${p.isActive ? "badge-green" : "badge-red"}`}>{p.isActive ? "Active" : "Off"}</span></td>
                                            <td>
                                                <button className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }} onClick={async () => {
                                                    if (!confirm("Deactivate product?")) return;
                                                    await fetch(`/api/products/${p.id}`, { method: "DELETE" });
                                                    showToast("Product deactivated");
                                                    loadAll();
                                                }}>Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!products.length && <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No products yet. Add one!</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Add Product Modal ─────────────────────────────────── */}
            {showAddProduct && <AddProductModal onClose={() => { setShowAddProduct(false); loadAll(); }} showToast={showToast} />}
        </div>
    );
}

function AddProductModal({ onClose, showToast }: { onClose: () => void; showToast: (m: string, t?: "success" | "error") => void }) {
    const [form, setForm] = useState({
        name: "", crop: "", variety: "", description: "",
        germinationRate: 92, purity: 98, batchNumber: "", testingDate: "",
        stock: 1000, price: 0, moq: 100, gstRate: 0,
    });
    const [loading, setLoading] = useState(false);
    const set = (k: string, v: string | number) => setForm(p => ({ ...p, [k]: v }));

    const save = async () => {
        setLoading(true);
        const r = await fetch("/api/products", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        });
        setLoading(false);
        if (r.ok) { showToast("Product added"); onClose(); }
        else { const d = await r.json(); showToast(d.error || "Failed", "error"); }
    };

    return (
        <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div className="card" style={{ width: "100%", maxWidth: 640, maxHeight: "90vh", overflow: "auto" }}>
                <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ fontWeight: 700 }}>Add Product</h2>
                    <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
                </div>
                <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className="form-group" style={{ gridColumn: "span 2" }}><label className="form-label">Product Name *</label><input className="form-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. HD-2967 Wheat" /></div>
                    <div className="form-group"><label className="form-label">Crop *</label><input className="form-input" value={form.crop} onChange={e => set("crop", e.target.value)} placeholder="e.g. Wheat" /></div>
                    <div className="form-group"><label className="form-label">Variety *</label><input className="form-input" value={form.variety} onChange={e => set("variety", e.target.value)} placeholder="e.g. HD-2967" /></div>
                    <div className="form-group"><label className="form-label">Batch Number *</label><input className="form-input" value={form.batchNumber} onChange={e => set("batchNumber", e.target.value)} placeholder="e.g. BT-2024-001" /></div>
                    <div className="form-group"><label className="form-label">Testing Date *</label><input className="form-input" value={form.testingDate} onChange={e => set("testingDate", e.target.value)} placeholder="e.g. Oct 2024" /></div>
                    <div className="form-group"><label className="form-label">Germination Rate %</label><input className="form-input" type="number" value={form.germinationRate} onChange={e => set("germinationRate", Number(e.target.value))} /></div>
                    <div className="form-group"><label className="form-label">Purity %</label><input className="form-input" type="number" value={form.purity} onChange={e => set("purity", Number(e.target.value))} /></div>
                    <div className="form-group"><label className="form-label">Price per kg (₹) *</label><input className="form-input" type="number" value={form.price} onChange={e => set("price", Number(e.target.value))} /></div>
                    <div className="form-group"><label className="form-label">Stock (kg) *</label><input className="form-input" type="number" value={form.stock} onChange={e => set("stock", Number(e.target.value))} /></div>
                    <div className="form-group"><label className="form-label">MOQ (kg)</label><input className="form-input" type="number" value={form.moq} onChange={e => set("moq", Number(e.target.value))} /></div>
                    <div className="form-group"><label className="form-label">GST Rate %</label><input className="form-input" type="number" value={form.gstRate} onChange={e => set("gstRate", Number(e.target.value))} /></div>
                    <div className="form-group" style={{ gridColumn: "span 2" }}><label className="form-label">Description</label><textarea className="form-textarea" rows={2} value={form.description} onChange={e => set("description", e.target.value)} style={{ minHeight: 60 }} /></div>
                </div>
                <div className="card-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? <span className="spinner" /> : "Add Product"}</button>
                </div>
            </div>
        </div>
    );
}
