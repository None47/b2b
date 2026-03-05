"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STATES = [
    "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
];

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        companyName: "", email: "", gstNumber: "", panNumber: "", phone: "", password: "", confirmPassword: "",
        state: "", district: "", pincode: "", address: "",
        gstCertUrl: "",
    });

    const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

    const nextStep = async () => {
        setError("");
        if (step === 1) {
            if (!form.companyName || !form.email || !form.gstNumber || !form.panNumber || !form.password) {
                return setError("Please fill all required fields.");
            }
            if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
            if (form.password.length < 8) return setError("Password must be at least 8 characters.");
            // Step 1: create user account via API, then advance to step 2
            return step1Submit();
        }
        if (step === 2) {
            if (!form.state || !form.district || !form.pincode || !form.address) {
                return setError("Please fill all location fields.");
            }
            setStep(3);
        }
    };

    // Step 1 — called when clicking "Continue" on Step 1 to create the user account
    const step1Submit = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyName: form.companyName,
                    email: form.email,
                    gstNumber: form.gstNumber,
                    panNumber: form.panNumber,
                    phone: form.phone,
                    password: form.password,
                    address: "",
                }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error || "Registration failed");
            setStep(2);
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Step 3 — called when clicking "Submit Application" with full distributor details
    const submit = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/distributor/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyName: form.companyName,
                    email: form.email,
                    gstNumber: form.gstNumber,
                    panNumber: form.panNumber,
                    phone: form.phone,
                    state: form.state,
                    district: form.district,
                    pincode: form.pincode,
                    address: form.address,
                    gstCertUrl: form.gstCertUrl,
                }),
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error || "Submission failed");
            router.push("/pending-approval");
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <nav style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, color: "var(--primary)", fontSize: "1.0625rem" }}>
                    <span>🌱</span> Tanindo Seeds
                </Link>
                <Link href="/login" className="btn btn-ghost btn-sm">Already have an account?</Link>
            </nav>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
                <div style={{ width: "100%", maxWidth: 520 }}>
                    {/* Progress */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
                        {[1, 2, 3].map((s) => (
                            <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? "var(--primary)" : "var(--border)", transition: "background 0.3s" }} />
                        ))}
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="label" style={{ marginBottom: 4 }}>Step {step} of 3</div>
                            <h1 className="heading-sm" style={{ color: "var(--primary)" }}>
                                {step === 1 && "Business Information"}
                                {step === 2 && "Location Details"}
                                {step === 3 && "Document Upload"}
                            </h1>
                        </div>
                        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                            {error && <div className="alert alert-danger">{error}</div>}

                            {/* Step 1 */}
                            {step === 1 && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Company Name *</label>
                                        <input className="form-input" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Acme Agro Pvt. Ltd." />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Business Email *</label>
                                        <input className="form-input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@company.com" />
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                        <div className="form-group">
                                            <label className="form-label">GST Number *</label>
                                            <input className="form-input" value={form.gstNumber} onChange={(e) => set("gstNumber", e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" maxLength={15} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">PAN Number *</label>
                                            <input className="form-input" value={form.panNumber} onChange={(e) => set("panNumber", e.target.value.toUpperCase())} placeholder="AAAAA0000A" maxLength={10} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input className="form-input" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                        <div className="form-group">
                                            <label className="form-label">Password *</label>
                                            <input className="form-input" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min. 8 characters" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Confirm Password *</label>
                                            <input className="form-input" type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} placeholder="Repeat password" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 2 */}
                            {step === 2 && (
                                <>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                        <div className="form-group">
                                            <label className="form-label">State *</label>
                                            <select className="form-select" value={form.state} onChange={(e) => set("state", e.target.value)}>
                                                <option value="">Select state</option>
                                                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">District *</label>
                                            <input className="form-input" value={form.district} onChange={(e) => set("district", e.target.value)} placeholder="e.g. Pune" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Pincode *</label>
                                        <input className="form-input" value={form.pincode} onChange={(e) => set("pincode", e.target.value)} placeholder="400001" maxLength={6} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Full Address *</label>
                                        <textarea className="form-textarea" value={form.address} onChange={(e) => set("address", e.target.value)} rows={3} placeholder="Building, street, city..." />
                                    </div>
                                </>
                            )}

                            {/* Step 3 */}
                            {step === 3 && (
                                <>
                                    <div className="alert alert-info">
                                        Your GST certificate will be reviewed by our admin team. Upload or provide a URL to your certificate.
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">GST Certificate URL</label>
                                        <input className="form-input" value={form.gstCertUrl} onChange={(e) => set("gstCertUrl", e.target.value)} placeholder="https://drive.google.com/... or leave blank" />
                                        <span className="form-hint">You can upload to Google Drive or Dropbox and paste the shareable link here.</span>
                                    </div>
                                    <div className="divider" />
                                    <div style={{ background: "var(--surface-muted)", borderRadius: "var(--radius-md)", padding: "16px" }}>
                                        <h4 style={{ fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>Review Your Details</h4>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontSize: "0.875rem" }}>
                                            {[
                                                ["Company", form.companyName], ["Email", form.email],
                                                ["GST", form.gstNumber], ["PAN", form.panNumber],
                                                ["State", form.state], ["District", form.district],
                                                ["Pincode", form.pincode],
                                            ].map(([label, value]) => (
                                                <div key={label}>
                                                    <span className="caption">{label}: </span>
                                                    <strong style={{ color: "var(--text)" }}>{value || "—"}</strong>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            {step > 1 ? (
                                <button className="btn btn-ghost btn-sm" onClick={() => setStep(step - 1)}>← Back</button>
                            ) : (
                                <Link href="/login" className="btn btn-ghost btn-sm">Sign in instead</Link>
                            )}
                            {step < 3 ? (
                                <button className="btn btn-primary" onClick={nextStep} disabled={loading}>
                                    {loading && step === 1 ? <span className="spinner" /> : "Continue →"}
                                </button>
                            ) : (
                                <button className="btn btn-primary" onClick={submit} disabled={loading}>
                                    {loading ? <span className="spinner" /> : "Submit Application"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
