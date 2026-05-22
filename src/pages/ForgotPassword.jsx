// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineMail } from "react-icons/ai";
import { resetPassword } from "../utils/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await resetPassword(email);
      setSuccessMsg(`Reset link sent to ${email}`);
    } catch (error) {
      let message = "An unknown error occurred.";
      if (error.code === "auth/user-not-found")
        message = "No account found with this email.";
      else if (error.code === "auth/invalid-email")
        message = "Please enter a valid email address.";
      else message = error.message;
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Mono:wght@300;400;500&display=swap');
        .et-page { min-height: calc(100vh - 70px); display: flex; align-items: center; justify-content: center; background: #080810; padding: 20px; position: relative; overflow: hidden; font-family: 'DM Mono', monospace; }
        .et-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; animation: orbPulse 8s ease-in-out infinite alternate; }
        .et-orb-1 { width: 450px; height: 450px; top: -150px; left: -100px; background: radial-gradient(circle, rgba(60,120,200,0.3) 0%, transparent 70%); }
        .et-orb-2 { width: 350px; height: 350px; bottom: -120px; right: -80px; background: radial-gradient(circle, rgba(99,60,180,0.28) 0%, transparent 70%); animation-delay: -4s; }
        @keyframes orbPulse { from { transform: scale(1); opacity: 0.7; } to { transform: scale(1.2) translate(10px,-10px); opacity: 1; } }
        .et-noise { position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E"); pointer-events: none; opacity: 0.4; }

        .et-card { background: rgba(14,14,28,0.82); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 52px 44px; width: 100%; max-width: 440px; position: relative; z-index: 10; box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 32px 64px rgba(0,0,0,0.6); opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .et-card.mounted { opacity: 1; transform: translateY(0); }

        .et-wordmark { display: flex; align-items: baseline; justify-content: center; gap: 6px; margin-bottom: 32px; }
        .et-wordmark-main { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 300; color: #f0eef8; letter-spacing: 2px; }
        .et-wordmark-dot { width: 7px; height: 7px; border-radius: 50%; background: linear-gradient(135deg, #9b6dff, #e060c0); flex-shrink: 0; box-shadow: 0 0 12px rgba(155,109,255,0.7); }

        .et-heading { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 400; color: #f0eef8; text-align: center; margin: 0 0 6px; letter-spacing: 0.5px; }
        .et-sub { font-size: 11px; color: rgba(180,170,210,0.6); text-align: center; margin: 0 0 36px; letter-spacing: 1.5px; text-transform: uppercase; }

        .et-error { background: rgba(220,60,80,0.12); border: 1px solid rgba(220,60,80,0.3); color: #f07080; padding: 12px 16px; border-radius: 10px; font-size: 12px; margin-bottom: 20px; }
        .et-success { background: rgba(40,180,100,0.1); border: 1px solid rgba(40,180,100,0.3); color: #60d090; padding: 12px 16px; border-radius: 10px; font-size: 12px; margin-bottom: 20px; letter-spacing: 0.3px; }

        .et-field { position: relative; margin-bottom: 20px; }
        .et-field-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: rgba(155,109,255,0.6); font-size: 16px; pointer-events: none; z-index: 2; }
        .et-input { width: 100%; padding: 14px 16px 14px 44px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: #f0eef8; font-family: 'DM Mono', monospace; font-size: 13px; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; outline: none; }
        .et-input::placeholder { color: rgba(180,170,210,0.35); font-size: 12px; letter-spacing: 0.5px; }
        .et-input:focus { border-color: rgba(155,109,255,0.5); background: rgba(155,109,255,0.06); box-shadow: 0 0 0 3px rgba(155,109,255,0.08); }

        .et-btn-primary { width: 100%; padding: 14px; background: linear-gradient(135deg, #7c4dff 0%, #c060d0 100%); border: none; border-radius: 12px; color: #fff; font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s; box-shadow: 0 8px 24px rgba(124,77,255,0.3); }
        .et-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(124,77,255,0.4); }
        .et-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .et-footer-link { text-align: center; margin-top: 28px; font-size: 11px; color: rgba(180,170,210,0.45); letter-spacing: 0.5px; }
        .et-footer-link a { color: rgba(155,109,255,0.9); text-decoration: none; margin-left: 6px; transition: color 0.2s; }
        .et-footer-link a:hover { color: #c090ff; }
      `}</style>

      <div className="et-page">
        <div className="et-orb et-orb-1" />
        <div className="et-orb et-orb-2" />
        <div className="et-noise" />

        <div className={`et-card ${mounted ? "mounted" : ""}`}>
          <div className="et-wordmark">
            <span className="et-wordmark-main">EmoTune</span>
            <div className="et-wordmark-dot" />
          </div>

          <h1 className="et-heading">Reset password</h1>
          <p className="et-sub">We'll send you a recovery link</p>

          {errorMsg && <div className="et-error">{errorMsg}</div>}
          {successMsg && <div className="et-success">✓ {successMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="et-field">
              <AiOutlineMail className="et-field-icon" />
              <input
                className="et-input"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              className="et-btn-primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="et-footer-link">
            Remember your password?
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
