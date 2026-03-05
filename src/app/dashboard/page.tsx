"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    items: { quantity: number; price: number; product: { name: string; variety: string } }[];
}

const STATUS_BADGE: Record<string, string> = {
    pending: "badge-yellow", approved: "badge-blue",
    shipped: "badge-blue", delivered: "badge-green", cancelled: "badge-red",
};

export default function DashboardPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = useCallback(async () => {
        const res = await fetch("/api/orders");
        if (res.status === 401) { router.push("/login"); return; }
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
    }, [router]);

    useEffect(() => { loadOrders(); }, [loadOrders]);

    const fmt = (v: number) => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
    const fmtD = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    const totalSpend = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            <nav style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "var(--shadow-xs)" }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: "var(--primary)", fontSize: "1.0625rem" }}>
                    <span>🌱</span> Tanindo Seeds
                </Link>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <Link href="/products" className="btn btn-primary btn-sm">Browse Seeds</Link>
                    <button className="btn btn-ghost btn-sm" onClick={async () => {
                        await fetch("/api/auth/logout", { method: "POST" });
                        router.push("/");
                    }}>Sign out</button>
                </div>
            </nav>

            <div className="container" style={{ padding: "48px 28px" }}>
                <div style={{ marginBottom: 36 }}>
                    <h1 className="heading-md" style={{ color: "var(--primary)" }}>My Dashboard</h1>
                    <p className="caption" style={{ marginTop: 4 }}>Manage your orders and track deliveries</p>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 40 }}>
                    {[
                        { label: "Total Orders", value: orders.length, icon: "📋" },
                        { label: "Pending", value: orders.filter(o => o.status === "pending").length, icon: "⏳" },
                        { label: "Delivered", value: orders.filter(o => o.status === "delivered").length, icon: "✅" },
                        { label: "Total Spend", value: fmt(totalSpend), icon: "₹" },
                    ].map(s => (
                        <div key={s.label} className="card card-body" style={{ boxShadow: "var(--shadow-sm)" }}>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>{s.value}</div>
                            <div className="caption" style={{ marginTop: 4 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Orders table */}
                <h2 className="heading-sm" style={{ marginBottom: 16, color: "var(--text)" }}>Order History</h2>
                {loading ? (
                    <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                        <span className="spinner-dark spinner" style={{ width: 28, height: 28 }} />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="card card-body" style={{ textAlign: "center", padding: "60px 24px" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
                        <h3 style={{ fontWeight: 600, marginBottom: 8 }}>No orders yet</h3>
                        <p className="caption" style={{ marginBottom: 24 }}>Browse our seed catalog to place your first order.</p>
                        <Link href="/products" className="btn btn-primary">Browse Seeds →</Link>
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Products</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o.id}>
                                        <td><code style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>{o.orderNumber}</code></td>
                                        <td>
                                            {o.items.map(i => (
                                                <div key={i.product.name} style={{ fontSize: "0.875rem" }}>
                                                    <strong>{i.product.variety}</strong> <span className="caption">× {i.quantity}</span>
                                                </div>
                                            ))}
                                        </td>
                                        <td><strong>{fmt(o.total)}</strong></td>
                                        <td><span className={`badge ${STATUS_BADGE[o.status] || "badge-gray"}`}>{o.status}</span></td>
                                        <td className="caption">{fmtD(o.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
