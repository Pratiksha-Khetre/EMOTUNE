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

  useEffect(() => {
    setMounted(true);
  }, []);

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
      if (error.code === "auth/invalid-credential")
        message = "Invalid email or password.";
      else if (error.code === "auth/too-many-requests")
        message = "Too many attempts. Try again later.";
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
          background: #080810;
          padding: 20px;
          position: relative;
          overflow: hidden;
          font-family: 'DM Mono', monospace;
        }

        .et-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: orbPulse 8s ease-in-out infinite alternate;
        }

        .et-orb-1 {
          width: 500px; height: 500px;
          top: -200px; left: -150px;
          background: radial-gradient(circle, rgba(99,60,180,0.35) 0%, transparent 70%);
          animation-delay: 0s;
        }

        .et-orb-2 {
          width: 400px; height: 400px;
          bottom: -150px; right: -100px;
          background: radial-gradient(circle, rgba(180,60,120,0.25) 0%, transparent 70%);
          animation-delay: -3s;
        }

        .et-orb-3 {
          width: 300px; height: 300px;
          top: 50%; left: 60%;
          background: radial-gradient(circle, rgba(60,120,200,0.2) 0%, transparent 70%);
          animation-delay: -6s;
        }

        @keyframes orbPulse {
          from { transform: scale(1) translate(0, 0); opacity: 0.8; }
          to { transform: scale(1.2) translate(20px, -20px); opacity: 1; }
        }

        .et-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.4;
        }

        .et-card {
          background: rgba(14, 14, 28, 0.8);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 52px 44px;
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 10;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 32px 64px rgba(0,0,0,0.6);
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .et-card.mounted {
          opacity: 1;
          transform: translateY(0);
        }

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
          color: #f0eef8;
          letter-spacing: 2px;
        }

        .et-wordmark-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: linear-gradient(135deg, #9b6dff, #e060c0);
          margin-bottom: 4px;
          flex-shrink: 0;
          box-shadow: 0 0 12px rgba(155,109,255,0.7);
        }

        .et-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 400;
          color: #f0eef8;
          text-align: center;
          margin: 0 0 6px;
          letter-spacing: 0.5px;
        }

        .et-sub {
          font-size: 11px;
          color: rgba(180,170,210,0.6);
          text-align: center;
          margin: 0 0 36px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .et-error {
          background: rgba(220,60,80,0.12);
          border: 1px solid rgba(220,60,80,0.3);
          color: #f07080;
          padding: 12px 16px;
          border-radius: 10px;
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
          color: rgba(155,109,255,0.6);
          font-size: 16px;
          pointer-events: none;
          z-index: 2;
        }

        .et-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #f0eef8;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
          letter-spacing: 0.3px;
        }

        .et-input::placeholder {
          color: rgba(180,170,210,0.35);
          font-size: 12px;
          letter-spacing: 0.5px;
        }

        .et-input:focus {
          border-color: rgba(155,109,255,0.5);
          background: rgba(155,109,255,0.06);
          box-shadow: 0 0 0 3px rgba(155,109,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .et-eye-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(180,170,210,0.4);
          cursor: pointer;
          font-size: 16px;
          z-index: 3;
          transition: color 0.2s;
          padding: 4px;
        }

        .et-eye-toggle:hover { color: rgba(155,109,255,0.8); }

        .et-forgot {
          text-align: right;
          margin: -4px 0 24px;
        }

        .et-forgot a {
          font-size: 11px;
          color: rgba(155,109,255,0.6);
          text-decoration: none;
          letter-spacing: 0.5px;
          transition: color 0.2s;
        }

        .et-forgot a:hover { color: rgba(155,109,255,1); }

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
          box-shadow: 0 8px 24px rgba(124,77,255,0.3);
          position: relative;
          overflow: hidden;
        }

        .et-btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .et-btn-primary:hover::before { opacity: 1; }
        .et-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(124,77,255,0.4); }
        .et-btn-primary:active { transform: translateY(0); }
        .et-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .et-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 24px 0;
        }

        .et-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .et-divider span {
          font-size: 11px;
          color: rgba(180,170,210,0.4);
          letter-spacing: 1px;
        }

        .et-btn-google {
          width: 100%;
          padding: 13px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: rgba(240,238,248,0.85);
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 1px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }

        .et-btn-google:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(155,109,255,0.3);
          transform: translateY(-1px);
        }

        .et-btn-google:disabled { opacity: 0.5; cursor: not-allowed; }

        .et-footer-link {
          text-align: center;
          margin-top: 28px;
          font-size: 11px;
          color: rgba(180,170,210,0.45);
          letter-spacing: 0.5px;
        }

        .et-footer-link a {
          color: rgba(155,109,255,0.9);
          text-decoration: none;
          margin-left: 6px;
          transition: color 0.2s;
        }

        .et-footer-link a:hover { color: #c090ff; }
      `}</style>

      <div className="et-page">
        <div className="et-orb et-orb-1" />
        <div className="et-orb et-orb-2" />
        <div className="et-orb et-orb-3" />
        <div className="et-noise" />

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
              <span
                className="et-eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>

            <div className="et-forgot">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button
              className="et-btn-primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="et-divider">
            <div className="et-divider-line" />
            <span>or</span>
            <div className="et-divider-line" />
          </div>

          <button
            className="et-btn-google"
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
          >
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
