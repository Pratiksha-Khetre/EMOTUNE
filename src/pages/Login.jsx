// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import {
  AiOutlineMail,
  AiOutlineLock,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";
import { loginUser, loginWithGoogle } from "../utils/authService";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { hasSetLanguage } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await loginUser(formData.email, formData.password);
      const shouldRedirectToMain = hasSetLanguage();
      navigate(shouldRedirectToMain ? "/main" : "/language", { replace: true });
    } catch (error) {
      setIsSubmitting(false);
      let message = "Login failed. Please check your credentials.";
      if (error.code === "auth/invalid-credential") message = "Invalid email or password.";
      else if (error.code === "auth/too-many-requests") message = "Too many attempts. Try again later.";
      setErrorMsg(message);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await loginWithGoogle();
      const shouldRedirectToMain = hasSetLanguage();
      navigate(shouldRedirectToMain ? "/main" : "/language", { replace: true });
    } catch (error) {
      setIsSubmitting(false);
      setErrorMsg("Google sign-in failed. Please try again.");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Mono:wght@300;400;500&display=swap');

        .et-page {
          min-height: calc(100vh - 70px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111827;
          padding: 20px;
          position: relative;
          overflow: hidden;
          font-family: 'DM Mono', monospace;
        }

        .et-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          animation: orbPulse 8s ease-in-out infinite alternate;
        }

        .et-orb-1 {
          width: 500px; height: 500px;
          top: -180px; left: -120px;
          background: radial-gradient(circle, rgba(100, 70, 200, 0.3) 0%, transparent 70%);
        }

        .et-orb-2 {
          width: 400px; height: 400px;
          bottom: -130px; right: -90px;
          background: radial-gradient(circle, rgba(190, 70, 130, 0.22) 0%, transparent 70%);
          animation-delay: -3s;
        }

        .et-orb-3 {
          width: 280px; height: 280px;
          top: 50%; left: 60%;
          background: radial-gradient(circle, rgba(70, 130, 210, 0.16) 0%, transparent 70%);
          animation-delay: -6s;
        }

        @keyframes orbPulse {
          from { transform: scale(1) translate(0, 0); opacity: 0.8; }
          to { transform: scale(1.2) translate(18px, -18px); opacity: 1; }
        }

        .et-card {
          background: rgba(22, 28, 52, 0.88);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(155, 109, 255, 0.15);
          border-radius: 22px;
          padding: 52px 44px;
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 10;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.4);
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .et-card.mounted { opacity: 1; transform: translateY(0); }

        .et-wordmark {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 6px;
          margin-bottom: 32px;
        }

        .et-wordmark-main {
          font-family: 'Cormorant Garamond', serif;
          font-size: 38px;
          font-weight: 300;
          color: #e8e4f8;
          letter-spacing: 2px;
        }

        .et-wordmark-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: linear-gradient(135deg, #9b6dff, #e060c0);
          flex-shrink: 0;
          box-shadow: 0 0 12px rgba(155, 109, 255, 0.6);
        }

        .et-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 400;
          color: #e8e4f8;
          text-align: center;
          margin: 0 0 6px;
          letter-spacing: 0.5px;
        }

        .et-sub {
          font-size: 11px;
          color: rgba(200, 185, 230, 0.65);
          text-align: center;
          margin: 0 0 36px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .et-error {
          background: rgba(220, 60, 80, 0.14);
          border: 1px solid rgba(220, 80, 100, 0.35);
          color: #f08090;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 12px;
          margin-bottom: 20px;
          letter-spacing: 0.3px;
        }

        .et-field {
          position: relative;
          margin-bottom: 16px;
        }

        .et-field-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(155, 109, 255, 0.7);
          font-size: 16px;
          pointer-events: none;
          z-index: 2;
        }

        .et-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          background: rgba(255, 255, 255, 0.06);
          border: 1.5px solid rgba(155, 109, 255, 0.18);
          border-radius: 12px;
          color: #e8e4f8;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
          letter-spacing: 0.3px;
        }

        .et-input::placeholder {
          color: rgba(200, 185, 230, 0.4);
          font-size: 12px;
          letter-spacing: 0.5px;
        }

        .et-input:focus {
          border-color: rgba(155, 109, 255, 0.6);
          background: rgba(155, 109, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(155, 109, 255, 0.1);
        }

        .et-eye-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(200, 185, 230, 0.5);
          cursor: pointer;
          font-size: 17px;
          z-index: 3;
          transition: color 0.2s;
          padding: 4px;
        }

        .et-eye-toggle:hover { color: rgba(155, 109, 255, 0.9); }

        .et-forgot {
          text-align: right;
          margin: -4px 0 24px;
        }

        .et-forgot a {
          font-size: 11px;
          color: rgba(155, 109, 255, 0.75);
          text-decoration: none;
          letter-spacing: 0.5px;
          transition: color 0.2s;
        }

        .et-forgot a:hover { color: #b890ff; }

        .et-btn-primary {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #7c4dff 0%, #c060d0 100%);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 8px 24px rgba(124, 77, 255, 0.3);
          position: relative;
          overflow: hidden;
        }

        .et-btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.12);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .et-btn-primary:hover::before { opacity: 1; }
        .et-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(124, 77, 255, 0.4); }
        .et-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

        .et-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 24px 0;
        }

        .et-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(155, 109, 255, 0.15);
        }

        .et-divider span {
          font-size: 11px;
          color: rgba(200, 185, 230, 0.5);
          letter-spacing: 1px;
        }

        .et-btn-google {
          width: 100%;
          padding: 13px;
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid rgba(155, 109, 255, 0.18);
          border-radius: 12px;
          color: rgba(232, 228, 248, 0.88);
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: 1px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }

        .et-btn-google:hover {
          background: rgba(155, 109, 255, 0.1);
          border-color: rgba(155, 109, 255, 0.35);
          transform: translateY(-1px);
        }

        .et-btn-google:disabled { opacity: 0.45; cursor: not-allowed; }

        .et-footer-link {
          text-align: center;
          margin-top: 28px;
          font-size: 11px;
          color: rgba(200, 185, 230, 0.55);
          letter-spacing: 0.5px;
        }

        .et-footer-link a {
          color: rgba(155, 109, 255, 0.95);
          text-decoration: none;
          margin-left: 6px;
          transition: color 0.2s;
        }

        .et-footer-link a:hover { color: #b890ff; }
      `}</style>

      <div className="et-page">
        <div className="et-orb et-orb-1" />
        <div className="et-orb et-orb-2" />
        <div className="et-orb et-orb-3" />

        <div className={`et-card ${mounted ? "mounted" : ""}`}>
          <div className="et-wordmark">
            <span className="et-wordmark-main">EmoTune</span>
            <div className="et-wordmark-dot" />
          </div>

          <h1 className="et-heading">Welcome back</h1>
          <p className="et-sub">Sign in to your account</p>

          {errorMsg && <div className="et-error">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="et-field">
              <AiOutlineMail className="et-field-icon" />
              <input
                className="et-input"
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
                required
              />
            </div>

            <div className="et-field">
              <AiOutlineLock className="et-field-icon" />
              <input
                className="et-input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                style={{ paddingRight: "44px" }}
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
                required
              />
              <span className="et-eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>

            <div className="et-forgot">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button className="et-btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="et-divider">
            <div className="et-divider-line" />
            <span>or</span>
            <div className="et-divider-line" />
          </div>

          <button className="et-btn-google" type="button" onClick={handleGoogleLogin} disabled={isSubmitting}>
            <FcGoogle size={18} />
            Continue with Google
          </button>

          <p className="et-footer-link">
            Don't have an account?
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
