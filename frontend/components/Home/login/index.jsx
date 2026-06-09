import React, { useState } from "react";
import { Form, Input, Button, message, Modal } from "antd";
import {
  UserOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  CheckCircleFilled,
  ArrowRightOutlined,
  GlobalOutlined,
  PhoneOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import { useAuth } from "../../../src/useAuth";

const Login = () => {
  const [form] = Form.useForm();
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState(null); // null (landing), 'admin', 'employee', 'customer'
  const [isSignUp, setIsSignUp] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (isSignUp && loginType === 'customer') {
        const { success, account } = await register(values.fullName, values.identifier, values.password);
        Modal.success({
          title: 'Account Created Successfully!',
          content: (
            <div>
              <p>Welcome, <b>{values.fullName}</b>! Your account has been provisioned.</p>
              <p style={{ marginTop: 10 }}>Your generated Account ID is: <br/><strong style={{ fontSize: 18, color: '#1a56db' }}>{account.accountNumber}</strong></p>
              <p>Please use this Account ID and your Email to log in.</p>
            </div>
          ),
          onOk() {
            setIsSignUp(false);
            form.resetFields();
          }
        });
      } else if (isSignUp) {
        if (loginType === 'employee' || loginType === 'admin') {
          const { success } = await register(values.fullName || values.identifier, values.identifier, values.password, loginType);
          message.success("Account created successfully. You are now logged in!");
          return;
        }
      } else {
        await login(values.identifier, values.password, loginType);
        message.success("Login successful. Access granted!");
      }
    } catch (err) {
      message.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const renderLanding = () => (
    <div style={{ width: '100vw', height: '100vh', overflowY: 'auto', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8fafc' }}>
      
      {/* ── TOP NAV HEADER ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 90, zIndex: 50,
        background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 60px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/sbi-logo.png" alt="SBI Logo" style={{ width: 46, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
          <span style={{ color: 'white', fontWeight: 900, fontSize: 22, letterSpacing: '0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>STATE BANK OF INDIA</span>
        </div>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center', display: 'none', '@media (min-width: 1024px)': { display: 'flex' } }}>
          <span style={{ color: 'white', fontWeight: 600, fontSize: 15, cursor: 'pointer', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Personal</span>
          <span style={{ color: 'white', fontWeight: 600, fontSize: 15, cursor: 'pointer', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Corporate</span>
          <span style={{ color: 'white', fontWeight: 600, fontSize: 15, cursor: 'pointer', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>NRI</span>
          <span style={{ color: 'white', fontWeight: 600, fontSize: 15, cursor: 'pointer', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>About Us</span>
          <Button type="primary" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontWeight: 600, padding: '0 28px', height: 44, borderRadius: 22, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            Support
          </Button>
        </div>
      </div>

      {/* ── HERO & PORTALS ── */}
      <div style={{
        minHeight: '85vh',
        width: '100%',
        backgroundImage: 'url(/sbi-hero-banner.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)' }} />
        
        <div style={{ zIndex: 1, textAlign: 'center', marginBottom: 50, padding: 20, paddingTop: 100 }}>
          <h1 style={{ color: 'white', fontSize: 52, fontWeight: 900, margin: 0, letterSpacing: '-0.02em', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>State Bank of India</h1>
          <p style={{ color: '#bae6fd', fontSize: 20, marginTop: 16, fontWeight: 500, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Select your portal to continue</p>
        </div>

        <div style={{ zIndex: 1, display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1000, padding: 20 }}>
          
          {/* Admin Card */}
          <div 
            onClick={() => { setLoginType('admin'); setIsSignUp(false); }}
            style={{ ...styles.landingCard }}
          >
            <div style={{ ...styles.cardIcon, background: '#fee2e2', color: '#ef4444' }}>
              <SafetyCertificateOutlined style={{ fontSize: 28 }} />
            </div>
            <h3 style={styles.cardTitle}>Admin Portal</h3>
            <p style={styles.cardDesc}>System administrators, directors, and branch managers.</p>
          </div>

          {/* Employee Card */}
          <div 
            onClick={() => { setLoginType('employee'); setIsSignUp(false); }}
            style={{ ...styles.landingCard }}
          >
            <div style={{ ...styles.cardIcon, background: '#fef3c7', color: '#f59e0b' }}>
              <BankOutlined style={{ fontSize: 28 }} />
            </div>
            <h3 style={styles.cardTitle}>Staff Portal</h3>
            <p style={styles.cardDesc}>Bank employees, tellers, and ledger management.</p>
          </div>

          {/* Customer Card */}
          <div 
            onClick={() => { setLoginType('customer'); setIsSignUp(false); }}
            style={{ ...styles.landingCard }}
          >
            <div style={{ ...styles.cardIcon, background: '#dbeafe', color: '#3b82f6' }}>
              <UserOutlined style={{ fontSize: 28 }} />
            </div>
            <h3 style={styles.cardTitle}>Customer Portal</h3>
            <p style={styles.cardDesc}>Retail banking, loans, and personal account access.</p>
          </div>

        </div>
      </div>

      {/* ── PRODUCTS & SERVICES ── */}
      <div style={{ padding: '80px 40px', backgroundColor: '#fff', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>Premium Loan Services</h2>
        <p style={{ color: '#64748b', fontSize: 16, margin: '0 0 60px 0', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          Explore our tailored financing options designed to help you achieve your personal and business milestones with competitive interest rates.
        </p>
        
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 1100, margin: '0 auto' }}>
          
          {/* Gold Loan */}
          <div style={styles.productCard}>
            <div style={styles.productImgWrapper}>
              <img src="/gold-loan.png" alt="Gold Loan" style={styles.productImg} />
            </div>
            <div style={styles.productContent}>
              <h3 style={styles.productTitle}>Gold Loan</h3>
              <p style={styles.productDesc}>Unlock the value of your gold with instant liquidity. Enjoy competitive interest rates, low processing fees, and secure vault storage.</p>
            </div>
          </div>

          {/* Car Loan */}
          <div style={styles.productCard}>
            <div style={styles.productImgWrapper}>
              <img src="/car-loan.png" alt="Car Loan" style={styles.productImg} />
            </div>
            <div style={styles.productContent}>
              <h3 style={styles.productTitle}>Car Loan</h3>
              <p style={styles.productDesc}>Drive home your dream vehicle with up to 100% financing, flexible repayment tenures, and zero prepayment penalties.</p>
            </div>
          </div>

          {/* Home Loan */}
          <div style={styles.productCard}>
            <div style={styles.productImgWrapper}>
              <img src="/home-loan.png" alt="Home Loan" style={styles.productImg} />
            </div>
            <div style={styles.productContent}>
              <h3 style={styles.productTitle}>Home Loan</h3>
              <p style={styles.productDesc}>Turn your dream home into reality. Low EMIs, quick digital processing, and transparent terms for a smooth experience.</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── HISTORY SECTION ── */}
      <div style={{ padding: '80px 40px', backgroundColor: '#f1f5f9', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#1e3a8a', margin: '0 0 24px 0', letterSpacing: '-0.02em' }}>Our Legacy</h2>
          <div style={{ width: 60, height: 4, backgroundColor: '#3b82f6', margin: '0 auto 32px auto', borderRadius: 2 }}></div>
          <p style={{ color: '#475569', fontSize: 18, lineHeight: '1.8', margin: '0 0 24px 0', textAlign: 'justify' }}>
            The State Bank of India (SBI) boasts a rich heritage that spans over two centuries. Our roots trace back to the establishment of the <strong>Bank of Calcutta in 1806</strong>, making us the oldest commercial bank in the Indian subcontinent. Through the amalgamation of the Bank of Bengal, the Bank of Bombay, and the Bank of Madras, the Imperial Bank of India was formed in 1921.
          </p>
          <p style={{ color: '#475569', fontSize: 18, lineHeight: '1.8', margin: '0 0 32px 0', textAlign: 'justify' }}>
            In 1955, the Reserve Bank of India acquired a controlling interest in the Imperial Bank of India, leading to the creation of the <strong>State Bank of India</strong> by an Act of Parliament. Today, SBI stands as a beacon of trust, serving hundreds of millions of customers globally, driving financial inclusion, and powering the economic growth of the nation.
          </p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ backgroundColor: '#0f172a', color: '#94a3b8', textAlign: 'center', padding: '40px 20px', fontSize: 13 }}>
        <img src="/sbi-logo.png" alt="SBI" style={{ width: 40, marginBottom: 16, opacity: 0.5, filter: 'grayscale(1)' }} />
        <p style={{ margin: '0 0 8px 0' }}>© 2026 State Bank of India. All rights reserved.</p>
        <p style={{ margin: 0, opacity: 0.7 }}>Regulated by the Reserve Bank of India. Secured with 256-bit encryption.</p>
      </div>

    </div>
  );

  const getPortalLabels = () => {
    if (isSignUp) {
      if (loginType === 'admin') return { title: 'Create Admin Account', idLabel: 'Admin ID', idPlaceholder: 'Create Admin ID', passLabel: 'Create Password', passPlaceholder: 'Create a strong password' };
      if (loginType === 'employee') return { title: 'Register as Staff', idLabel: 'Employee Name', idPlaceholder: 'Enter your full name', passLabel: 'Email ID', passPlaceholder: 'Enter your email address' };
      return { title: 'Open an Account', idLabel: 'Email ID / Phone Number', idPlaceholder: 'Enter your email or phone', passLabel: 'Create Password', passPlaceholder: 'Create a strong password' };
    }
    if (loginType === 'admin') return { title: 'Admin Login', idLabel: 'Admin ID', idPlaceholder: 'Enter Admin ID', passLabel: 'Password', passPlaceholder: 'Enter Password' };
    if (loginType === 'employee') return { title: 'Staff Portal Login', idLabel: 'Employee Name', idPlaceholder: 'Enter your employee name', passLabel: 'Email ID', passPlaceholder: 'Enter your email address' };
    return { title: 'Secure Sign In', idLabel: 'Account ID', idPlaceholder: 'e.g., BANK-12345', passLabel: 'Email ID', passPlaceholder: 'Enter your email address' };
  };

  const portalInfo = getPortalLabels();

  if (loginType === null) return renderLanding();

  return (
    <div style={styles.root}>
      {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
      <div style={styles.leftPanel}>
        <div style={styles.leftOverlay} />
        <div style={styles.leftContent}>
          <div style={styles.leftLogoRow}>
            <img src="/sbi-logo.png" alt="SBI Logo" style={styles.leftLogo} />
            <div>
              <div style={styles.leftBankName}>State Bank of India</div>
              <div style={styles.leftBankTagline}>Institutional Banking Portal</div>
            </div>
          </div>
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
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
      <div style={styles.rightPanel}>
        <div style={styles.formWrapper}>
          
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => { setLoginType(null); form.resetFields(); setIsSignUp(false); }}
            style={{ marginBottom: 20, color: '#64748b', fontWeight: 600, padding: 0 }}
          >
            Back to Portals
          </Button>

          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>{portalInfo.title}</h2>
            <p style={styles.formSubtitle}>
              {isSignUp ? "Register as a new customer to receive your Account ID." : `Enter your authorized credentials for the ${loginType} portal.`}
            </p>
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} style={{ marginTop: 8 }}>
            
            {isSignUp && loginType === 'admin' && (
              <Form.Item
                name="fullName"
                label={<span style={styles.fieldLabel}>Full Name</span>}
                rules={[{ required: true, message: "Please enter your full name" }, { min: 3, message: "Must be at least 3 characters" }]}
              >
                <Input prefix={<UserOutlined style={{ color: "#1e3a8a" }} />} placeholder="Enter your full name" size="large" style={styles.input} />
              </Form.Item>
            )}

            <Form.Item
              name="identifier"
              label={<span style={styles.fieldLabel}>{portalInfo.idLabel}</span>}
              rules={[{ required: true, message: `Please enter your ${portalInfo.idLabel}` }, { min: 3, message: "Must be at least 3 characters" }]}
            >
              <Input prefix={<UserOutlined style={{ color: "#1e3a8a" }} />} placeholder={portalInfo.idPlaceholder} size="large" style={styles.input} />
            </Form.Item>

            {/* In Staff registration, email acts as password, so we map it appropriately */}
            <Form.Item
              name="password"
              label={<span style={styles.fieldLabel}>{portalInfo.passLabel}</span>}
              rules={[{ required: true, message: `Please enter your ${portalInfo.passLabel}` }]}
              style={{ marginBottom: 20 }}
            >
              <Input.Password prefix={<LockOutlined style={{ color: "#1a56db" }} />} placeholder={portalInfo.passPlaceholder} size="large" style={styles.input} />
            </Form.Item>

            <div style={styles.securityNotice}>
              <SafetyCertificateOutlined style={{ color: "#1e3a8a", marginRight: 6, flexShrink: 0 }} />
              <span>Your session is protected with end-to-end encryption. Never share your credentials.</span>
            </div>

            <Form.Item style={{ marginBottom: 12, marginTop: 16 }}>
              <Button type="primary" htmlType="submit" loading={loading} size="large" style={styles.submitBtn} block>
                {isSignUp ? "Create Account" : "Sign In Securely"}
                {!loading && <ArrowRightOutlined style={{ marginLeft: 8 }} />}
              </Button>
            </Form.Item>
          </Form>

          {(loginType === 'employee' || loginType === 'admin') && (
            <div style={styles.toggleRow}>
              <span style={styles.toggleText}>{isSignUp ? "Already registered? " : "New staff member? "}</span>
              <button style={styles.toggleLink} onClick={(e) => { e.preventDefault(); form.resetFields(); setIsSignUp(!isSignUp); }}>
                {isSignUp ? "Sign In" : "Open an Account"}
              </button>
            </div>
          )}

          <div style={styles.formFooter}>
            <span>© 2026 State Bank of India. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  landingCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: '32px 24px',
    width: 280,
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto'
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 10px 0'
  },
  cardDesc: {
    fontSize: 14,
    color: '#64748b',
    margin: 0,
    lineHeight: 1.5
  },
  productCard: {
    width: 320,
    background: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
    transition: 'transform 0.3s ease',
    textAlign: 'left'
  },
  productImgWrapper: {
    height: 200,
    width: '100%',
    overflow: 'hidden',
    background: '#e2e8f0'
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  productContent: {
    padding: 24
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 10px 0',
    letterSpacing: '-0.01em'
  },
  productDesc: {
    fontSize: 14,
    color: '#64748b',
    margin: 0,
    lineHeight: 1.6
  },
  root: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    fontFamily: "system-ui, -apple-system, sans-serif",
    overflow: "hidden",
  },
  leftPanel: {
    flex: "1.2",
    position: "relative",
    backgroundImage: "url('/bank-img.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "#fff",
  },
  leftOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, rgba(30,58,138,0.95) 0%, rgba(29,78,216,0.85) 100%)",
  },
  leftContent: {
    position: "relative",
    zIndex: 2,
    padding: "60px 52px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  leftLogoRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: "auto",
  },
  leftLogo: {
    height: 48,
    width: "auto",
    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
  },
  leftBankName: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.01em",
  },
  leftBankTagline: {
    fontSize: 12,
    color: "#93c5fd",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginTop: 2,
  },
  heroSection: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginTop: 60,
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.1)",
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: 600,
    padding: "6px 14px",
    borderRadius: 20,
    width: "fit-content",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 40,
    fontWeight: 800,
    lineHeight: 1.2,
    margin: 0,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    lineHeight: 1.6,
    margin: 0,
    maxWidth: 400,
  },
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
    maxWidth: 420,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 8px",
  },
  formSubtitle: {
    fontSize: 14,
    color: "#64748b",
    margin: 0,
    lineHeight: 1.5,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
  },
  input: {
    borderRadius: 10,
    height: 48,
    fontSize: 15,
  },
  securityNotice: {
    display: "flex",
    alignItems: "flex-start",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 12,
    color: "#1e40af",
    lineHeight: 1.5,
    fontWeight: 500,
  },
  submitBtn: {
    height: 50,
    borderRadius: 10,
    background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
    border: "none",
    color: "white",
    fontWeight: 700,
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleRow: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
  toggleText: {
    color: "#64748b",
  },
  toggleLink: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
    padding: 0,
  },
  formFooter: {
    textAlign: "center",
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 32,
  },
};

export default Login;