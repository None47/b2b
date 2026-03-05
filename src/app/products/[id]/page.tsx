"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Product {
    id: string; name: string; crop: string; variety: string;
    description?: string; germinationRate: number; purity: number;
    batchNumber: string; testingDate: string; stock: number;
    price: number; moq: number; gstRate: number;
}

export default function ProductDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(0);
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        const res = await fetch(`/api/products/${id}`);
        if (res.status === 401) { router.push("/login"); return; }
        if (res.status === 403) { router.push("/pending-approval"); return; }
        if (res.ok) {
            const data = await res.json();
            setProduct(data);
            setQuantity(data.moq);
        }
        setLoading(false);
    }, [id, router]);

    useEffect(() => { load(); }, [load]);

    const fmt = (v: number) => `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
    const total = product ? product.price * quantity * (1 + product.gstRate / 100) : 0;

    const placeOrder = async () => {
        if (!product) return;
        if (quantity < product.moq) return setError(`Minimum order quantity is ${product.moq} kg`);
        if (quantity > product.stock) return setError(`Only ${product.stock} kg available in stock`);
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: [{ productId: product.id, quantity }], notes }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error || "Order failed");
            setSuccess(true);
            setTimeout(() => router.push("/dashboard"), 2000);
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="spinner-dark spinner" style={{ width: 32, height: 32 }} />
        </div>
    );

    if (!product) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
            <p>Product not found</p>
            <Link href="/products" className="btn btn-primary">← Back to Catalog</Link>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            <nav style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "var(--shadow-xs)" }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: "var(--primary)", fontSize: "1.0625rem" }}>
                    <span>🌱</span> Tanindo Seeds
                </Link>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <Link href="/products" className="btn btn-ghost btn-sm">← Catalog</Link>
                    <Link href="/dashboard" className="btn btn-ghost btn-sm">My Orders</Link>
                </div>
            </nav>

            <div className="container" style={{ padding: "48px 28px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
                    {/* Product Details */}
                    <div>
                        <div className="label" style={{ marginBottom: 8 }}>{product.crop}</div>
                        <h1 className="heading-lg" style={{ color: "var(--primary)", marginBottom: 8 }}>{product.name}</h1>
                        <p style={{ fontSize: "1.0625rem", color: "var(--text-muted)", marginBottom: 32 }}>{product.variety}</p>

                        {product.description && (
                            <div className="card card-body" style={{ marginBottom: 24 }}>
                                <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Description</h3>
                                <p style={{ color: "var(--text-muted)", lineHeight: 1.75 }}>{product.description}</p>
                            </div>
                        )}

                        {/* Specs */}
                        <h2 style={{ fontWeight: 700, marginBottom: 16, color: "var(--text)" }}>Product Specifications</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {[
                                ["Germination Rate", `${product.germinationRate}%`],
                                ["Purity", `${product.purity}%`],
                                ["Batch Number", product.batchNumber],
                                ["Testing Date", product.testingDate],
                                ["Available Stock", `${product.stock.toLocaleString()} kg`],
                                ["Minimum Order", `${product.moq} kg`],
                                ["Price", fmt(product.price) + " / kg"],
                                ["GST Rate", `${product.gstRate}%`],
                            ].map(([label, value]) => (
                                <div key={label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 16px" }}>
                                    <div className="caption">{label}</div>
                                    <div style={{ fontWeight: 600, color: "var(--text)", marginTop: 2 }}>{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Panel */}
                    <div style={{ position: "sticky", top: 80 }}>
                        <div className="card">
                            <div className="card-header">
                                <h2 style={{ fontWeight: 700, color: "var(--primary)" }}>Place Order</h2>
                            </div>
                            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {success ? (
                                    <div className="alert alert-success" style={{ textAlign: "center" }}>
                                        ✅ Order placed! Redirecting to dashboard...
                                    </div>
                                ) : (
                                    <>
                                        {error && <div className="alert alert-danger">{error}</div>}
                                        <div className="form-group">
                                            <label className="form-label">Quantity (kg) — Min: {product.moq} kg</label>
                                            <input
                                                className="form-input"
                                                type="number"
                                                min={product.moq}
                                                max={product.stock}
                                                step={product.moq}
                                                value={quantity}
                                                onChange={(e) => setQuantity(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Notes (optional)</label>
                                            <textarea className="form-textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                                                placeholder="Delivery instructions, etc." style={{ minHeight: 60 }} />
                                        </div>
                                        <div className="divider" style={{ margin: "4px 0" }} />
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                                            <span className="caption">Base ({quantity} kg × {fmt(product.price)})</span>
                                            <span>{fmt(product.price * quantity)}</span>
                                        </div>
                                        {product.gstRate > 0 && (
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                                                <span className="caption">GST ({product.gstRate}%)</span>
                                                <span>{fmt(product.price * quantity * product.gstRate / 100)}</span>
                                            </div>
                                        )}
                                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.0625rem", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                                            <span>Total</span>
                                            <span style={{ color: "var(--primary)" }}>{fmt(total)}</span>
                                        </div>
                                        <button className="btn btn-primary btn-full" onClick={placeOrder} disabled={submitting}>
                                            {submitting ? <span className="spinner" /> : "Place Order →"}
                                        </button>
                                        <p className="caption" style={{ textAlign: "center" }}>Order will be reviewed by admin before processing</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
