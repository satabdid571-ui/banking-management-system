import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  CheckCircleFilled,
  ArrowRightOutlined,
  GlobalOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../src/useAuth";

const Login = () => {
  const [form] = Form.useForm();
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('customer'); // 'customer' or 'employee'
  const [isSignUp, setIsSignUp] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (isSignUp) {
        await register(values.fullName, values.identifier, values.password);
        message.success("Account created successfully! Welcome bonus of ₹1,000 deposited.");
      } else {
        await login(values.identifier, values.password);
        message.success("Login successful. Access granted!");
      }
    } catch (err) {
      message.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={styles.root}>
      {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
      <div style={styles.leftPanel}>
        {/* Gradient overlay */}
        <div style={styles.leftOverlay} />

        {/* Floating animated circles */}
        <div style={{ ...styles.circle, width: 300, height: 300, top: -80, left: -80, opacity: 0.08 }} />
        <div style={{ ...styles.circle, width: 200, height: 200, bottom: 100, right: -60, opacity: 0.06 }} />
        <div style={{ ...styles.circle, width: 150, height: 150, top: "40%", left: "60%", opacity: 0.05 }} />

        <div style={styles.leftContent}>
          {/* Logo + Bank name */}
          <div style={styles.leftLogoRow}>
            <img src="/sbi-logo.png" alt="SBI Logo" style={styles.leftLogo} />
            <div>
              <div style={styles.leftBankName}>State Bank of India</div>
              <div style={styles.leftBankTagline}>Institutional Banking Portal</div>
            </div>
          </div>

          {/* Hero text */}
          <div style={styles.heroSection}>
            <div style={styles.heroBadge}>
              <SafetyCertificateOutlined style={{ marginRight: 6, color: "#60a5fa" }} />
              Secured with 256-bit SSL Encryption
            </div>
            <h1 style={styles.heroTitle}>
              Trusted Banking,<br />Powerful Management.
            </h1>
            <p style={styles.heroSubtitle}>
              The complete institutional management system for branches, employees, and customers — built for security, speed and scale.
            </p>
          </div>

          {/* Stats row */}
          <div style={styles.statsRow}>
            {[
              { label: "Active Customers", value: "2M+" },
              { label: "Assets Under Mgmt", value: "₹500Cr+" },
              { label: "Daily Transactions", value: "1.2L+" },
            ].map((s) => (
              <div key={s.label} style={styles.statBox}>
                <div style={styles.statValue}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div style={styles.badgesRow}>
            {["RBI Regulated", "ISO 27001 Certified", "CERT-In Compliant"].map((b) => (
              <div key={b} style={styles.badge}>
                <CheckCircleFilled style={{ color: "#60a5fa", marginRight: 5, fontSize: 11 }} />
                {b}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom footer strip */}
        <div style={styles.leftFooter}>
          <div style={styles.leftFooterItem}>
            <GlobalOutlined style={{ marginRight: 5 }} /> www.onlinesbi.sbi
          </div>
          <div style={styles.leftFooterItem}>
            <PhoneOutlined style={{ marginRight: 5 }} /> 1800-11-2211 (Toll Free)
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
      <div style={styles.rightPanel}>
        <div style={styles.formWrapper}>

          {/* Header */}
          <div style={styles.formHeader}>
            <div style={styles.formLogoRow}>
              <div style={styles.formLogoIcon}>
                <BankOutlined style={{ fontSize: 20, color: "#1a56db" }} />
              </div>
              <div style={styles.formLogoText}>
                <div style={styles.formBankName}>SBI Portal</div>
                <div style={styles.formBankSub}>Management System</div>
              </div>
            </div>
            <div style={styles.divider} />
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <Button 
                type={loginType === 'customer' ? 'primary' : 'default'} 
                onClick={() => { setLoginType('customer'); form.resetFields(); }}
                style={{ flex: 1, borderRadius: '8px' }}
              >
                Customer Portal
              </Button>
              <Button 
                type={loginType === 'employee' ? 'primary' : 'default'} 
                onClick={() => { setLoginType('employee'); setIsSignUp(false); form.resetFields(); }}
                style={{ flex: 1, borderRadius: '8px' }}
              >
                Staff Portal
              </Button>
            </div>

            <h2 style={styles.formTitle}>
              {loginType === 'employee' 
                ? "Staff Portal Login" 
                : isSignUp ? "Create Account" : "Secure Sign In"}
            </h2>
            <p style={styles.formSubtitle}>
              {loginType === 'employee'
                ? "Enter your employee name and email address."
                : isSignUp
                  ? "Register as a new customer. A welcome bonus of ₹1,000 will be credited."
                  : "Enter your authorized credentials to access the banking portal."}
            </p>
          </div>

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            style={{ marginTop: 8 }}
          >
            {isSignUp && (
              <Form.Item
                name="fullName"
                label={<span style={styles.fieldLabel}>Full Name</span>}
                rules={[
                  { required: true, message: "Please enter your full name" },
                  { min: 3, message: "Must be at least 3 characters" },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "#1e3a8a" }} />}
                  placeholder="Enter your full name"
                  size="large"
                  style={styles.input}
                />
              </Form.Item>
            )}

            <Form.Item
              name="identifier"
              label={<span style={styles.fieldLabel}>{
                loginType === 'employee' 
                  ? "Employee Name" 
                  : isSignUp ? "Email ID / Phone Number" : "User ID / Email / Phone"
              }</span>}
              rules={[
                { required: true, message: "Please enter your ID" },
                { min: 3, message: "Must be at least 3 characters" },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#1e3a8a" }} />}
                placeholder={
                  loginType === 'employee'
                    ? "Enter your employee name"
                    : isSignUp ? "Enter your email or phone number" : "Enter User ID, email, or phone"
                }
                size="large"
                style={styles.input}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={styles.fieldLabel}>{loginType === 'employee' ? "Email ID" : "Password / IPIN"}</span>}
              rules={[
                { required: true, message: loginType === 'employee' ? "Please enter your email" : "Please enter your password" },
                { min: 6, message: "Must be at least 6 characters" },
              ]}
              style={{ marginBottom: 20 }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#1a56db" }} />}
                placeholder={loginType === 'employee' ? "Enter your email address" : "Enter your internet banking password"}
                size="large"
                style={styles.input}
              />
            </Form.Item>

            {/* Security notice */}
            <div style={styles.securityNotice}>
              <SafetyCertificateOutlined style={{ color: "#1e3a8a", marginRight: 6, flexShrink: 0 }} />
              <span>Your session is protected with end-to-end encryption. Never share your credentials.</span>
            </div>

            <Form.Item style={{ marginBottom: 12, marginTop: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={styles.submitBtn}
                block
              >
                {isSignUp ? "Open Account" : "Sign In Securely"}
                {!loading && <ArrowRightOutlined style={{ marginLeft: 8 }} />}
              </Button>
            </Form.Item>
          </Form>

          {/* Toggle */}
          {loginType === 'customer' && (
            <div style={styles.toggleRow}>
              <span style={styles.toggleText}>
                {isSignUp ? "Already registered? " : "New customer? "}
              </span>
              <button
                style={styles.toggleLink}
                onClick={(e) => { e.preventDefault(); form.resetFields(); setIsSignUp(!isSignUp); }}
              >
                {isSignUp ? "Sign In" : "Open an Account"}
              </button>
            </div>
          )}



          {/* Footer */}
          <div style={styles.formFooter}>
            <span>© 2026 State Bank of India. All rights reserved.</span>
            <span style={{ margin: "0 8px" }}>·</span>
            <span>Privacy Policy</span>
            <span style={{ margin: "0 8px" }}>·</span>
            <span>Terms of Use</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },

  // Left panel
  leftPanel: {
    flex: "0 0 48%",
    position: "relative",
    background: `linear-gradient(145deg, #0f2d6e 0%, #1a56db 50%, #1e3a8a 100%)`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  leftOverlay: {
    position: "absolute",
    inset: 0,
    background: "url('/bank-img.jpg') center/cover no-repeat",
    opacity: 0.12,
    pointerEvents: "none",
  },
  circle: {
    position: "absolute",
    borderRadius: "50%",
    background: "#fff",
    pointerEvents: "none",
  },
  leftContent: {
    position: "relative",
    zIndex: 2,
    padding: "48px 52px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 32,
  },
  leftLogoRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  leftLogo: {
    width: 56,
    height: 56,
    objectFit: "contain",
    borderRadius: 12,
    background: "#fff",
    padding: 6,
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  },
  leftBankName: {
    color: "#fff",
    fontWeight: 800,
    fontSize: 18,
    letterSpacing: "0.02em",
    lineHeight: 1.2,
  },
  leftBankTagline: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginTop: 2,
  },
  heroSection: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    background: "rgba(74, 222, 128, 0.12)",
    border: "1px solid rgba(74, 222, 128, 0.3)",
    color: "#93c5fd",
    fontSize: 11,
    fontWeight: 600,
    padding: "5px 12px",
    borderRadius: 20,
    width: "fit-content",
    letterSpacing: "0.02em",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 34,
    fontWeight: 800,
    lineHeight: 1.25,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
    lineHeight: 1.7,
    margin: 0,
    maxWidth: 380,
  },
  statsRow: {
    display: "flex",
    gap: 16,
  },
  statBox: {
    flex: 1,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: "16px 14px",
    backdropFilter: "blur(4px)",
  },
  statValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  statLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    fontWeight: 500,
    marginTop: 5,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  badgesRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  badge: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontWeight: 500,
    padding: "5px 12px",
    borderRadius: 20,
  },
  leftFooter: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    gap: 24,
    padding: "16px 52px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  leftFooterItem: {
    display: "flex",
    alignItems: "center",
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    fontWeight: 500,
  },

  // Right panel
  rightPanel: {
    flex: 1,
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 24px",
    overflowY: "auto",
  },
  formWrapper: {
    width: "100%",
    maxWidth: 440,
  },
  formHeader: {
    marginBottom: 24,
  },
  formLogoRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  formLogoIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: "#eff6ff",
    border: "1.5px solid #bfdbfe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  formLogoText: {
    lineHeight: 1.2,
  },
  formBankName: {
    fontSize: 15,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.01em",
  },
  formBankSub: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: 500,
  },
  divider: {
    height: 1,
    background: "#e2e8f0",
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 6px",
    letterSpacing: "-0.02em",
  },
  formSubtitle: {
    fontSize: 13,
    color: "#64748b",
    margin: 0,
    lineHeight: 1.6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#374151",
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  input: {
    borderRadius: 10,
    height: 46,
    background: "#fff",
    borderColor: "#d1d5db",
    fontSize: 14,
  },
  securityNotice: {
    display: "flex",
    alignItems: "flex-start",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 11.5,
    color: "#1e40af",
    lineHeight: 1.5,
    fontWeight: 500,
  },
  submitBtn: {
    height: 48,
    borderRadius: 10,
    background: "linear-gradient(135deg, #1a56db 0%, #1d4ed8 100%)",
    border: "none",
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: "0.01em",
    boxShadow: "0 4px 20px rgba(26,86,219,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleRow: {
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
    fontSize: 13,
  },
  toggleText: {
    color: "#64748b",
  },
  toggleLink: {
    background: "none",
    border: "none",
    color: "#1a56db",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 13,
    padding: 0,
  },


  // Form footer
  formFooter: {
    textAlign: "center",
    fontSize: 11,
    color: "#94a3b8",
    lineHeight: 1.6,
  },
};

export default Login;