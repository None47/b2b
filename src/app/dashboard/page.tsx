"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/* ─── TYPES ──────────────────────────────────────────────────── */
type Page = "dashboard" | "orders" | "products" | "inventory" | "analytics" | "payments" | "customers" | "settings";

/* ─── MOCK DATA ──────────────────────────────────────────────── */
const MOCK_ORDERS = [
    { id: "ORD-2841", buyer: "Agrotech Solutions", product: "Hybrid Tomato F1", qty: 500, total: 62500, status: "delivered", date: "2026-03-01" },
    { id: "ORD-2840", buyer: "GreenField Farms", product: "Cucumber Malini", qty: 300, total: 24000, status: "shipped", date: "2026-03-02" },
    { id: "ORD-2839", buyer: "Sunrise Agro Pvt", product: "Chilli Kashi Anmol", qty: 1000, total: 45000, status: "pending", date: "2026-03-03" },
    { id: "ORD-2838", buyer: "Bharat Seeds Co.", product: "Paddy IR64", qty: 2000, total: 110000, status: "pending", date: "2026-03-04" },
    { id: "ORD-2837", buyer: "Punjab Agri Mart", product: "Wheat HD3226", qty: 1500, total: 75000, status: "delivered", date: "2026-03-05" },
    { id: "ORD-2836", buyer: "Deccan Farmers", product: "Cotton MRC 7361", qty: 800, total: 136000, status: "shipped", date: "2026-02-28" },
    { id: "ORD-2835", buyer: "Vidarbha Seeds", product: "Soybean JS9560", qty: 2500, total: 87500, status: "cancelled", date: "2026-02-26" },
];

const MOCK_PRODUCTS = [
    { id: 1, name: "Hybrid Tomato F1", category: "Vegetables", price: 125, stock: 4800, status: "active", moq: 100 },
    { id: 2, name: "Cucumber Malini", category: "Vegetables", price: 80, stock: 120, status: "low_stock", moq: 50 },
    { id: 3, name: "Chilli Kashi Anmol", category: "Spices", price: 45, stock: 6200, status: "active", moq: 200 },
    { id: 4, name: "Paddy IR64", category: "Grains", price: 55, stock: 18000, status: "active", moq: 500 },
    { id: 5, name: "Wheat HD3226", category: "Grains", price: 50, stock: 75, status: "low_stock", moq: 500 },
    { id: 6, name: "Cotton MRC 7361", category: "Cash Crops", price: 170, stock: 3400, status: "active", moq: 100 },
    { id: 7, name: "Soybean JS9560", category: "Oilseeds", price: 35, stock: 22, status: "critical", moq: 200 },
];

const MONTHLY_REVENUE = [65000, 89000, 72000, 115000, 98000, 143000, 127000, 162000, 145000, 189000, 176000, 210000];
const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const TOP_PRODUCTS = [
    { name: "Paddy IR64", sales: 42, revenue: 462000 },
    { name: "Hybrid Tomato F1", sales: 38, revenue: 380000 },
    { name: "Cotton MRC 7361", sales: 29, revenue: 493000 },
    { name: "Chilli Kashi Anmol", sales: 24, revenue: 108000 },
    { name: "Wheat HD3226", sales: 18, revenue: 135000 },
];

const MOCK_CUSTOMERS = [
    { name: "Agrotech Solutions", email: "orders@agrotech.in", orders: 12, spent: 842000, status: "approved", joined: "2025-08" },
    { name: "GreenField Farms", email: "buy@greenfield.in", orders: 8, spent: 384000, status: "approved", joined: "2025-10" },
    { name: "Sunrise Agro Pvt", email: "purchase@sunrise.in", orders: 5, spent: 225000, status: "approved", joined: "2025-11" },
    { name: "Bharat Seeds Co.", email: "bharat@seeds.in", orders: 3, spent: 330000, status: "pending", joined: "2026-01" },
    { name: "Punjab Agri Mart", email: "info@punjabagri.in", orders: 7, spent: 525000, status: "approved", joined: "2025-09" },
];

/* ─── HELPERS ────────────────────────────────────────────────── */
const fmt = (v: number) => `₹${v.toLocaleString("en-IN")}`;
const fmtK = (v: number) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : fmt(v);

const STATUS_COLOR: Record<string, { bg: string; color: string; dot: string }> = {
    pending: { bg: "rgba(251,191,36,0.15)", color: "#F59E0B", dot: "#F59E0B" },
    shipped: { bg: "rgba(96,165,250,0.15)", color: "#60A5FA", dot: "#60A5FA" },
    delivered: { bg: "rgba(52,211,153,0.15)", color: "#34D399", dot: "#34D399" },
    cancelled: { bg: "rgba(248,113,113,0.15)", color: "#F87171", dot: "#F87171" },
    approved: { bg: "rgba(52,211,153,0.15)", color: "#34D399", dot: "#34D399" },
    active: { bg: "rgba(52,211,153,0.15)", color: "#34D399", dot: "#34D399" },
    low_stock: { bg: "rgba(251,191,36,0.15)", color: "#F59E0B", dot: "#F59E0B" },
    critical: { bg: "rgba(248,113,113,0.15)", color: "#F87171", dot: "#F87171" },
};

function StatusBadge({ status, label }: { status: string; label?: string }) {
    const s = STATUS_COLOR[status] || { bg: "rgba(148,163,184,0.15)", color: "#94A3B8", dot: "#94A3B8" };
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
            {(label ?? status).toUpperCase()}
        </span>
    );
}

/* ─── SPARKLINE CHART ────────────────────────────────────────── */
function MiniChart({ data, color = "#10B981" }: { data: number[]; color?: string }) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 120; const h = 36;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * h * 0.8 - h * 0.1;
        return `${x},${y}`;
    }).join(" ");
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
}

/* ─── BAR CHART ──────────────────────────────────────────────── */
function BarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
    const max = Math.max(...data);
    const h = 160;
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: h + 24, paddingBottom: 24, position: "relative" }}>
            {data.map((v, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                    <div
                        style={{ width: "100%", height: `${(v / max) * h}px`, background: color, borderRadius: "4px 4px 0 0", transition: "height 0.6s cubic-bezier(.4,0,.2,1)", opacity: 0.85 + 0.15 * (v / max) }}
                        title={fmtK(v)}
                    />
                    <span style={{ fontSize: 9, color: "#64748B", whiteSpace: "nowrap" }}>{labels[i]}</span>
                </div>
            ))}
        </div>
    );
}

/* ─── SIDEBAR ITEM ───────────────────────────────────────────── */
const NAV_ITEMS: { key: Page; icon: string; label: string }[] = [
    { key: "dashboard", icon: "▣", label: "Dashboard" },
    { key: "orders", icon: "📦", label: "Orders" },
    { key: "products", icon: "🌱", label: "Products" },
    { key: "inventory", icon: "📊", label: "Inventory" },
    { key: "analytics", icon: "📈", label: "Analytics" },
    { key: "payments", icon: "💳", label: "Payments" },
    { key: "customers", icon: "👥", label: "Customers" },
    { key: "settings", icon: "⚙️", label: "Settings" },
];

/* ─── CARD ───────────────────────────────────────────────────── */
function DashCard({ label, value, sub, icon, trend, sparkData, color = "#10B981" }: {
    label: string; value: string; sub: string; icon: string; trend: string; sparkData?: number[]; color?: string;
}) {
    const up = trend.startsWith("+");
    return (
        <div className="db-card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ fontSize: 28 }}>{icon}</div>
                <span style={{ fontSize: 12, fontWeight: 700, color: up ? "#34D399" : "#F87171", background: up ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)", padding: "2px 8px", borderRadius: 99 }}>{trend}</span>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#F1F5F9", lineHeight: 1, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>{label}</div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>{sub}</div>
            {sparkData && <div style={{ marginTop: 12 }}><MiniChart data={sparkData} color={color} /></div>}
        </div>
    );
}

/* ─── SECTION HEADER ─────────────────────────────────────────── */
function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#F1F5F9", margin: 0 }}>{title}</h2>
                {sub && <p style={{ fontSize: 12, color: "#64748B", margin: "2px 0 0" }}>{sub}</p>}
            </div>
            {action}
        </div>
    );
}

/* ─── ACTION BUTTON ──────────────────────────────────────────── */
function Btn({ children, variant = "ghost", onClick, small }: { children: React.ReactNode; variant?: "primary" | "ghost" | "danger" | "outline"; onClick?: () => void; small?: boolean }) {
    const styles: Record<string, React.CSSProperties> = {
        primary: { background: "#10B981", color: "#fff", border: "1.5px solid #10B981" },
        ghost: { background: "rgba(255,255,255,0.07)", color: "#94A3B8", border: "1.5px solid rgba(255,255,255,0.08)" },
        danger: { background: "rgba(248,113,113,0.15)", color: "#F87171", border: "1.5px solid rgba(248,113,113,0.25)" },
        outline: { background: "transparent", color: "#94A3B8", border: "1.5px solid rgba(255,255,255,0.12)" },
    };
    return (
        <button onClick={onClick} style={{
            ...styles[variant], borderRadius: 7, padding: small ? "5px 12px" : "8px 16px",
            fontSize: small ? 11 : 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
            transition: "all 0.15s", letterSpacing: "0.02em", fontFamily: "inherit",
        }}>{children}</button>
    );
}

/* ─── DATA TABLE ─────────────────────────────────────────────── */
function DataTable({ cols, rows }: { cols: string[]; rows: React.ReactNode[][] }) {
    return (
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        {cols.map(c => (
                            <th key={c} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#475569", background: "#0D1321", borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>{c}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} style={{ transition: "background 0.15s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                            {row.map((cell, j) => (
                                <td key={j} style={{ padding: "12px 14px", fontSize: 13, color: "#CBD5E1", borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", verticalAlign: "middle" }}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ─── PAGES ──────────────────────────────────────────────────── */

function DashboardHome() {
    const totalRevenue = MOCK_ORDERS.filter(o => o.status !== "cancelled").reduce((a, b) => a + b.total, 0);
    const pending = MOCK_ORDERS.filter(o => o.status === "pending").length;
    const todayOrders = 3;
    return (
        <div>
            {/* Overview Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
                <DashCard label="Orders Today" value={String(todayOrders)} sub="vs 4 yesterday" icon="📦" trend="-1" sparkData={[4, 2, 5, 3, 6, 4, 3]} color="#60A5FA" />
                <DashCard label="Total Revenue" value={fmtK(totalRevenue)} sub="All time earnings" icon="💰" trend="+18%" sparkData={MONTHLY_REVENUE.slice(-7)} color="#10B981" />
                <DashCard label="Pending Orders" value={String(pending)} sub="Needs attention" icon="⏳" trend={`+${pending}`} sparkData={[1, 3, 2, 5, 3, 4, 2]} color="#F59E0B" />
                <DashCard label="Products Listed" value={String(MOCK_PRODUCTS.length)} sub="2 low stock alerts" icon="🌱" trend="+2" sparkData={[5, 5, 6, 6, 7, 7, 7]} color="#A78BFA" />
            </div>

            {/* Low Stock Alert */}
            {MOCK_PRODUCTS.filter(p => p.status !== "active").length > 0 && (
                <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20 }}>⚠️</span>
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>Low Stock Alert — </span>
                        <span style={{ fontSize: 13, color: "#94A3B8" }}>
                            {MOCK_PRODUCTS.filter(p => p.status !== "active").map(p => p.name).join(", ")} running low.
                        </span>
                    </div>
                    <Btn variant="outline" small>View Inventory</Btn>
                </div>
            )}

            {/* Recent orders */}
            <SectionHeader title="Recent Orders" sub="Last 7 orders placed on platform" action={<Btn variant="outline" small>View All</Btn>} />
            <DataTable
                cols={["Order ID", "Buyer", "Product", "Qty", "Amount", "Status", "Date"]}
                rows={MOCK_ORDERS.slice(0, 5).map(o => [
                    <code key={o.id} style={{ fontSize: 11, color: "#60A5FA", fontFamily: "monospace" }}>{o.id}</code>,
                    o.buyer,
                    o.product,
                    <span key="qty" style={{ color: "#94A3B8" }}>{o.qty.toLocaleString()} kg</span>,
                    <strong key="amt" style={{ color: "#F1F5F9" }}>{fmt(o.total)}</strong>,
                    <StatusBadge key="st" status={o.status} />,
                    <span key="d" style={{ color: "#475569", fontSize: 11 }}>{o.date}</span>,
                ])}
            />

            {/* Low Stock Products */}
            <div style={{ marginTop: 28 }}>
                <SectionHeader title="⚠️ Low Stock Alerts" sub="Products requiring urgent restock" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {MOCK_PRODUCTS.filter(p => p.status !== "active").map(p => (
                        <div key={p.id} className="db-card" style={{ padding: 16, borderColor: p.status === "critical" ? "rgba(248,113,113,0.3)" : "rgba(251,191,36,0.2)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>{p.name}</span>
                                <StatusBadge status={p.status} label={p.status === "critical" ? "Critical" : "Low Stock"} />
                            </div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: p.status === "critical" ? "#F87171" : "#F59E0B" }}>{p.stock.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 400, color: "#64748B", marginLeft: 4 }}>kg left</span></div>
                            <div style={{ marginTop: 10 }}>
                                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
                                    <div style={{ height: "100%", width: `${Math.min((p.stock / 500) * 100, 100)}%`, background: p.status === "critical" ? "#F87171" : "#F59E0B", borderRadius: 99, transition: "width 0.5s" }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function OrdersPage() {
    const [filter, setFilter] = useState("all");
    const filtered = filter === "all" ? MOCK_ORDERS : MOCK_ORDERS.filter(o => o.status === filter);
    return (
        <div>
            <SectionHeader title="Orders" sub={`${MOCK_ORDERS.length} total orders`} action={<Btn variant="primary" small>Export CSV</Btn>} />
            {/* Filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {["all", "pending", "shipped", "delivered", "cancelled"].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                        background: filter === f ? "#10B981" : "rgba(255,255,255,0.06)",
                        color: filter === f ? "#fff" : "#64748B",
                        border: filter === f ? "1.5px solid #10B981" : "1.5px solid rgba(255,255,255,0.08)",
                        textTransform: "capitalize", transition: "all 0.15s",
                    }}>{f === "all" ? `All (${MOCK_ORDERS.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${MOCK_ORDERS.filter(o => o.status === f).length})`}</button>
                ))}
            </div>
            <DataTable
                cols={["Order ID", "Buyer", "Product", "Qty", "Amount", "Status", "Date", "Actions"]}
                rows={filtered.map(o => [
                    <code key={o.id} style={{ fontSize: 11, color: "#60A5FA", fontFamily: "monospace" }}>{o.id}</code>,
                    o.buyer,
                    o.product,
                    `${o.qty.toLocaleString()} kg`,
                    <strong key="a" style={{ color: "#F1F5F9" }}>{fmt(o.total)}</strong>,
                    <StatusBadge key="s" status={o.status} />,
                    <span key="d" style={{ color: "#475569", fontSize: 11 }}>{o.date}</span>,
                    <div key="act" style={{ display: "flex", gap: 6 }}>
                        {o.status === "pending" && <><Btn variant="primary" small>Accept</Btn><Btn variant="danger" small>Cancel</Btn></>}
                        {o.status === "approved" && <Btn variant="outline" small>Mark Shipped</Btn>}
                        {o.status === "shipped" && <Btn variant="ghost" small>Track</Btn>}
                        <Btn variant="ghost" small>View</Btn>
                    </div>,
                ])}
            />
        </div>
    );
}

function ProductsPage() {
    const [showAdd, setShowAdd] = useState(false);
    return (
        <div>
            <SectionHeader title="Products" sub="Manage your seed catalog" action={<Btn variant="primary" onClick={() => setShowAdd(!showAdd)}>+ Add Product</Btn>} />
            {showAdd && (
                <div className="db-card" style={{ padding: 20, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 16 }}>Add New Product</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        {["Product Name", "Category", "Price (₹/kg)", "Stock (kg)", "MOQ (kg)", "GST Rate %"].map(f => (
                            <div key={f}>
                                <label style={{ fontSize: 11, color: "#64748B", fontWeight: 600, display: "block", marginBottom: 4 }}>{f}</label>
                                <input placeholder={f} style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "#CBD5E1", fontSize: 13, fontFamily: "inherit" }} />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                        <Btn variant="primary">Save Product</Btn>
                        <Btn variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
                    </div>
                </div>
            )}
            <DataTable
                cols={["Product", "Category", "Price", "Stock", "MOQ", "Status", "Actions"]}
                rows={MOCK_PRODUCTS.map(p => [
                    <strong key="n" style={{ color: "#F1F5F9" }}>{p.name}</strong>,
                    <span key="c" style={{ color: "#94A3B8", fontSize: 11 }}>{p.category}</span>,
                    <span key="p" style={{ color: "#10B981", fontWeight: 700 }}>₹{p.price}/kg</span>,
                    <span key="s" style={{ color: p.stock < 100 ? "#F87171" : p.stock < 500 ? "#F59E0B" : "#CBD5E1" }}>{p.stock.toLocaleString()} kg</span>,
                    <span key="m" style={{ color: "#64748B" }}>{p.moq} kg</span>,
                    <StatusBadge key="st" status={p.status} label={p.status.replace("_", " ")} />,
                    <div key="a" style={{ display: "flex", gap: 6 }}>
                        <Btn variant="ghost" small>Edit</Btn>
                        <Btn variant="outline" small>Stock+</Btn>
                        <Btn variant="danger" small>Delete</Btn>
                    </div>,
                ])}
            />
        </div>
    );
}

function InventoryPage() {
    return (
        <div>
            <SectionHeader title="Inventory Management" sub="Track and manage your stock levels" />
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
                {[
                    { label: "Total Products", value: MOCK_PRODUCTS.length, icon: "🌱", color: "#10B981" },
                    { label: "Low Stock", value: MOCK_PRODUCTS.filter(p => p.status === "low_stock").length, icon: "⚠️", color: "#F59E0B" },
                    { label: "Critical Stock", value: MOCK_PRODUCTS.filter(p => p.status === "critical").length, icon: "🔴", color: "#F87171" },
                ].map(c => (
                    <div key={c.label} className="db-card" style={{ padding: 16, display: "flex", gap: 14, alignItems: "center" }}>
                        <span style={{ fontSize: 30 }}>{c.icon}</span>
                        <div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: c.color }}>{c.value}</div>
                            <div style={{ fontSize: 12, color: "#64748B" }}>{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>
            <DataTable
                cols={["Product", "Category", "Current Stock", "Min Stock", "Stock Level", "Status", "Action"]}
                rows={MOCK_PRODUCTS.map(p => {
                    const pct = Math.min((p.stock / 5000) * 100, 100);
                    const barColor = p.status === "critical" ? "#F87171" : p.status === "low_stock" ? "#F59E0B" : "#10B981";
                    return [
                        <strong key="n" style={{ color: "#F1F5F9" }}>{p.name}</strong>,
                        <span key="c" style={{ color: "#64748B", fontSize: 11 }}>{p.category}</span>,
                        <span key="cs" style={{ fontWeight: 700, color: barColor }}>{p.stock.toLocaleString()} kg</span>,
                        <span key="ms" style={{ color: "#64748B" }}>5,000 kg</span>,
                        <div key="bar" style={{ width: 110, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 99, transition: "width 0.5s" }} />
                        </div>,
                        <StatusBadge key="st" status={p.status} label={p.status.replace("_", " ")} />,
                        <Btn key="a" variant="outline" small>Restock</Btn>,
                    ];
                })}
            />
        </div>
    );
}

function AnalyticsPage() {
    return (
        <div>
            <SectionHeader title="Analytics" sub="Sales performance and insights" action={<Btn variant="outline" small>Download Report</Btn>} />
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
                {/* Revenue Chart */}
                <div className="db-card" style={{ padding: 20 }}>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>Monthly Revenue (FY 2025–26)</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "#10B981", marginTop: 4 }}>{fmtK(MONTHLY_REVENUE.reduce((a, b) => a + b, 0))}</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>Total annual revenue</div>
                    </div>
                    <BarChart data={MONTHLY_REVENUE} labels={MONTHS} color="#10B981" />
                </div>
                {/* Top Products */}
                <div className="db-card" style={{ padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", marginBottom: 16 }}>Top Products by Revenue</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {TOP_PRODUCTS.map((p, i) => {
                            const maxRev = TOP_PRODUCTS[0].revenue;
                            const pct = (p.revenue / maxRev) * 100;
                            return (
                                <div key={p.name}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, color: "#CBD5E1" }}>{i + 1}. {p.name}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: "#10B981" }}>{fmtK(p.revenue)}</span>
                                    </div>
                                    <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
                                        <div style={{ height: "100%", width: `${pct}%`, background: `hsl(${160 - i * 15}, 70%, 52%)`, borderRadius: 99 }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {/* Revenue growth */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[
                    { label: "This Month", value: fmtK(MONTHLY_REVENUE[11]), trend: "+19%", color: "#10B981" },
                    { label: "Last Month", value: fmtK(MONTHLY_REVENUE[10]), trend: "+23%", color: "#60A5FA" },
                    { label: "Avg Order Value", value: fmt(Math.round(MOCK_ORDERS.reduce((a, b) => a + b.total, 0) / MOCK_ORDERS.length)), trend: "+8%", color: "#A78BFA" },
                    { label: "Total Orders", value: String(MOCK_ORDERS.length), trend: "+15%", color: "#F59E0B" },
                ].map(({ label, value, trend, color }) => (
                    <div key={label} className="db-card" style={{ padding: 16 }}>
                        <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>{label}</div>
                        <div style={{ fontSize: "1.35rem", fontWeight: 800, color }}>{value}</div>
                        <div style={{ fontSize: 11, color: "#34D399", marginTop: 4 }}>{trend} vs last period</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PaymentsPage() {
    const total = MOCK_ORDERS.filter(o => o.status !== "cancelled").reduce((a, b) => a + b.total, 0);
    const pending = MOCK_ORDERS.filter(o => o.status === "pending").reduce((a, b) => a + b.total, 0);
    const completed = total - pending;
    return (
        <div>
            <SectionHeader title="Payments" sub="Track earnings and payouts" action={<Btn variant="primary" small>Request Payout</Btn>} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
                {[
                    { label: "Total Earnings", value: fmt(total), icon: "💰", color: "#10B981", sub: "All completed orders" },
                    { label: "Pending Payouts", value: fmt(pending), icon: "⏳", color: "#F59E0B", sub: "Awaiting clearance" },
                    { label: "Completed Payouts", value: fmt(completed), icon: "✅", color: "#60A5FA", sub: "Transferred to bank" },
                ].map(c => (
                    <div key={c.label} className="db-card" style={{ padding: 20 }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.value}</div>
                        <div style={{ fontSize: 12, color: "#64748B" }}>{c.label}</div>
                        <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{c.sub}</div>
                    </div>
                ))}
            </div>
            <SectionHeader title="Payment History" />
            <DataTable
                cols={["Order", "Buyer", "Amount", "Mode", "Status", "Date"]}
                rows={MOCK_ORDERS.map(o => [
                    <code key={o.id} style={{ fontSize: 11, color: "#60A5FA", fontFamily: "monospace" }}>{o.id}</code>,
                    o.buyer,
                    <strong key="a" style={{ color: "#F1F5F9" }}>{fmt(o.total)}</strong>,
                    "NEFT",
                    <StatusBadge key="s" status={o.status === "delivered" ? "approved" : o.status === "cancelled" ? "cancelled" : "pending"} label={o.status === "delivered" ? "Paid" : o.status === "cancelled" ? "Cancelled" : "Pending"} />,
                    <span key="d" style={{ color: "#475569", fontSize: 11 }}>{o.date}</span>,
                ])}
            />
        </div>
    );
}

function CustomersPage() {
    return (
        <div>
            <SectionHeader title="Customers" sub={`${MOCK_CUSTOMERS.length} registered buyers`} action={<Btn variant="outline" small>Export</Btn>} />
            <DataTable
                cols={["Company", "Email", "Orders", "Lifetime Spend", "Status", "Joined"]}
                rows={MOCK_CUSTOMERS.map(c => [
                    <strong key="n" style={{ color: "#F1F5F9" }}>{c.name}</strong>,
                    <span key="e" style={{ color: "#64748B", fontSize: 12 }}>{c.email}</span>,
                    c.orders,
                    <span key="s" style={{ color: "#10B981", fontWeight: 700 }}>{fmtK(c.spent)}</span>,
                    <StatusBadge key="st" status={c.status} />,
                    <span key="j" style={{ color: "#64748B", fontSize: 11 }}>{c.joined}</span>,
                ])}
            />
        </div>
    );
}

function SettingsPage() {
    const [saved, setSaved] = useState(false);
    const [tab, setTab] = useState<"company" | "bank" | "security">("company");
    return (
        <div>
            <SectionHeader title="Settings" sub="Manage your seller profile and preferences" />
            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(255,255,255,0.04)", padding: 4, borderRadius: 10, width: "fit-content" }}>
                {(["company", "bank", "security"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: "7px 18px", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                        background: tab === t ? "#10B981" : "transparent", color: tab === t ? "#fff" : "#64748B",
                        border: "none", textTransform: "capitalize", transition: "all 0.15s",
                    }}>{t === "company" ? "Company Info" : tab === "bank" ? "Bank Details" : t.charAt(0).toUpperCase() + t.slice(1)}</button>
                ))}
            </div>
            {saved && <div style={{ padding: "10px 16px", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 8, color: "#34D399", fontSize: 13, marginBottom: 16 }}>✓ Settings saved successfully!</div>}
            <div className="db-card" style={{ padding: 24 }}>
                {tab === "company" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                        {[["Company Name", "Tanindo Seeds Pvt. Ltd."], ["GST Number", "29AAACT1234C1Z5"], ["PAN Number", "AAACT1234C"], ["Phone", "+91 99999 99999"], ["Email", "orders@tanindo.in"], ["State", "Karnataka"], ["District", "Bangalore Rural"], ["Pincode", "562123"]].map(([label, val]) => (
                            <div key={label}>
                                <label style={{ fontSize: 11, color: "#64748B", fontWeight: 600, display: "block", marginBottom: 5 }}>{label}</label>
                                <input defaultValue={val} style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "#CBD5E1", fontSize: 13, fontFamily: "inherit" }} />
                            </div>
                        ))}
                        <div style={{ gridColumn: "1 / -1" }}>
                            <label style={{ fontSize: 11, color: "#64748B", fontWeight: 600, display: "block", marginBottom: 5 }}>Full Address</label>
                            <textarea rows={3} defaultValue="Plot 14, KIADB Industrial Area, Bangalore Rural, Karnataka - 562123" style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "#CBD5E1", fontSize: 13, fontFamily: "inherit", resize: "vertical" }} />
                        </div>
                    </div>
                )}
                {tab === "bank" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                        {[["Account Holder Name", "Tanindo Seeds Pvt Ltd"], ["Account Number", "•••• •••• 4567"], ["IFSC Code", "SBIN0012345"], ["Bank Name", "State Bank of India"], ["Branch", "Devanahalli, Bangalore"]].map(([label, val]) => (
                            <div key={label}>
                                <label style={{ fontSize: 11, color: "#64748B", fontWeight: 600, display: "block", marginBottom: 5 }}>{label}</label>
                                <input defaultValue={val} style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "#CBD5E1", fontSize: 13, fontFamily: "inherit" }} />
                            </div>
                        ))}
                    </div>
                )}
                {tab === "security" && (
                    <div style={{ maxWidth: 400, display: "flex", flexDirection: "column", gap: 16 }}>
                        {["Current Password", "New Password", "Confirm New Password"].map(label => (
                            <div key={label}>
                                <label style={{ fontSize: 11, color: "#64748B", fontWeight: 600, display: "block", marginBottom: 5 }}>{label}</label>
                                <input type="password" placeholder="••••••••" style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "#CBD5E1", fontSize: 13, fontFamily: "inherit" }} />
                            </div>
                        ))}
                    </div>
                )}
                <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                    <Btn variant="primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}>Save Changes</Btn>
                    <Btn variant="ghost">Reset</Btn>
                </div>
            </div>
        </div>
    );
}

/* ─── MAIN DASHBOARD SHELL ───────────────────────────────────── */
export default function DashboardPage() {
    const router = useRouter();
    const [page, setPage] = useState<Page>("dashboard");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [notifs, setNotifs] = useState(4);

    const pageComponents: Record<Page, React.ReactNode> = {
        dashboard: <DashboardHome />,
        orders: <OrdersPage />,
        products: <ProductsPage />,
        inventory: <InventoryPage />,
        analytics: <AnalyticsPage />,
        payments: <PaymentsPage />,
        customers: <CustomersPage />,
        settings: <SettingsPage />,
    };

    const pageTitle: Record<Page, string> = {
        dashboard: "Dashboard", orders: "Orders", products: "Products",
        inventory: "Inventory", analytics: "Analytics", payments: "Payments",
        customers: "Customers", settings: "Settings",
    };

    const sideW = sidebarCollapsed ? 64 : 224;

    return (
        <>
            <style>{`
        .db-root { display: flex; min-height: 100vh; background: #0A0F1E; font-family: 'Inter', -apple-system, sans-serif; }
        .db-sidebar { width: ${sideW}px; background: #0D1321; border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; transition: width 0.2s; overflow: hidden; }
        .db-main { margin-left: ${sideW}px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; transition: margin-left 0.2s; }
        .db-topbar { height: 60px; background: #0D1321; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; padding: 0 24px; gap: 16px; position: sticky; top: 0; z-index: 50; }
        .db-content { flex: 1; padding: 28px; overflow-y: auto; }
        .db-card { background: #111827; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; transition: border-color 0.15s, box-shadow 0.15s; }
        .db-card:hover { border-color: rgba(255,255,255,0.12); box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
        .db-nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; cursor: pointer; border-radius: 8px; transition: all 0.15s; margin: 2px 8px; }
        .db-nav-item:hover { background: rgba(255,255,255,0.05); }
        .db-nav-active { background: rgba(16,185,129,0.12) !important; border: 1px solid rgba(16,185,129,0.2); }
        .db-search { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 7px 14px; color: #94A3B8; font-family: inherit; font-size: 13px; width: 240px; outline: none; }
        .db-search:focus { border-color: #10B981; background: rgba(16,185,129,0.05); }
        .db-search::placeholder { color: #475569; }
        .db-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #10B981, #059669); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: #fff; cursor: pointer; flex-shrink: 0; }
        .db-notif { width: 36px; height: 36px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; flex-shrink: 0; }
        .db-notif:hover { background: rgba(255,255,255,0.1); }
        @media (max-width: 768px) { .db-sidebar { width: 64px; } .db-main { margin-left: 64px; } .db-search { width: 150px; } }
      `}</style>

            <div className="db-root">
                {/* Sidebar */}
                <aside className="db-sidebar">
                    {/* Logo */}
                    <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: 10, minHeight: 60, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#10B981,#059669)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🌱</div>
                        {!sidebarCollapsed && <span style={{ fontSize: 14, fontWeight: 800, color: "#F1F5F9", whiteSpace: "nowrap" }}>Tanindo Seeds</span>}
                        <button onClick={() => setSidebarCollapsed(c => !c)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
                            {sidebarCollapsed ? "›" : "‹"}
                        </button>
                    </div>

                    {/* Nav */}
                    <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
                        {!sidebarCollapsed && <div style={{ padding: "8px 24px 4px", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#334155", textTransform: "uppercase" }}>Main Menu</div>}
                        {NAV_ITEMS.map(item => (
                            <div key={item.key} className={`db-nav-item${page === item.key ? " db-nav-active" : ""}`} onClick={() => setPage(item.key)}>
                                <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
                                {!sidebarCollapsed && <span style={{ fontSize: 13, fontWeight: 600, color: page === item.key ? "#10B981" : "#64748B", whiteSpace: "nowrap" }}>{item.label}</span>}
                                {!sidebarCollapsed && item.key === "orders" && <span style={{ marginLeft: "auto", minWidth: 20, height: 18, background: "#F59E0B", borderRadius: 99, fontSize: 10, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>2</span>}
                            </div>
                        ))}
                    </nav>

                    {/* Bottom logout */}
                    <div style={{ padding: "8px 0 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <div className="db-nav-item" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); }}>
                            <span style={{ fontSize: 17 }}>🚪</span>
                            {!sidebarCollapsed && <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>Logout</span>}
                        </div>
                    </div>
                </aside>

                {/* Main area */}
                <div className="db-main">
                    {/* Top bar */}
                    <header className="db-topbar">
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, color: "#334155", fontWeight: 600 }}>TANINDO SEEDS</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9" }}>{pageTitle[page]}</div>
                        </div>
                        <input className="db-search" placeholder="🔍 Search orders, products..." />
                        <div className="db-notif" onClick={() => setNotifs(0)}>
                            <span style={{ fontSize: 17 }}>🔔</span>
                            {notifs > 0 && (
                                <span style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, background: "#F87171", borderRadius: 99, fontSize: 10, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{notifs}</span>
                            )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="db-avatar">T</div>
                            {!sidebarCollapsed && (
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#F1F5F9" }}>Tanindo Seeds</span>
                                    <span style={{ fontSize: 10, color: "#475569" }}>Seller Account</span>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="db-content">
                        {pageComponents[page]}
                    </main>
                </div>
            </div>
        </>
    );
}
