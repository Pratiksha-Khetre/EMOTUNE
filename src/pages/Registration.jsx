// src/pages/Registration.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { AiOutlineMail, AiOutlineLock, AiOutlineUser } from "react-icons/ai";
import { auth } from "../utils/firebaseConfig";
import { initializeUserProfile } from "../utils/statsTracker";

const Registration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg("All fields are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      let user = userCredential.user;
      await updateProfile(user, { displayName: formData.name });
      user = { ...user, displayName: formData.name };
      await initializeUserProfile(user);
      navigate("/dashboard", { replace: true });
    } catch (authError) {
      setIsSubmitting(false);
      let message = "Registration failed. Please try again.";
      if (authError.code === "auth/email-already-in-use") message = "This email is already registered.";
      else if (authError.code === "auth/weak-password") message = "Password should be at least 6 characters.";
      setErrorMsg(message);
    }
  };

  const isButtonDisabled = isSubmitting || !formData.name || !formData.email || !formData.password;

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
          position: absolute; border-radius: 50%; filter: blur(90px);
          pointer-events: none; animation: orbPulse 8s ease-in-out infinite alternate;
        }
        .et-orb-1 { width: 500px; height: 500px; top: -180px; right: -120px; background: radial-gradient(circle, rgba(190, 70, 130, 0.28) 0%, transparent 70%); }
        .et-orb-2 { width: 420px; height: 420px; bottom: -140px; left: -90px; background: radial-gradient(circle, rgba(100, 70, 200, 0.28) 0%, transparent 70%); animation-delay: -4s; }
        .et-orb-3 { width: 260px; height: 260px; top: 40%; left: 55%; background: radial-gradient(circle, rgba(70, 145, 210, 0.16) 0%, transparent 70%); animation-delay: -2s; }

        @keyframes orbPulse {
          from { transform: scale(1); opacity: 0.7; }
          to { transform: scale(1.25) translate(14px, -14px); opacity: 1; }
        }

        .et-card {
          background: rgba(22, 28, 52, 0.88);
          backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(155, 109, 255, 0.15);
          border-radius: 22px; padding: 52px 44px;
          width: 100%; max-width: 440px;
          position: relative; z-index: 10;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.4);
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .et-card.mounted { opacity: 1; transform: translateY(0); }

        .et-wordmark { display: flex; align-items: baseline; justify-content: center; gap: 6px; margin-bottom: 32px; }
        .et-wordmark-main { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 300; color: #e8e4f8; letter-spacing: 2px; }
        .et-wordmark-dot { width: 7px; height: 7px; border-radius: 50%; background: linear-gradient(135deg, #9b6dff, #e060c0); flex-shrink: 0; box-shadow: 0 0 12px rgba(155,109,255,0.6); }

        .et-heading { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 400; color: #e8e4f8; text-align: center; margin: 0 0 6px; letter-spacing: 0.5px; }
        .et-sub { font-size: 11px; color: rgba(200, 185, 230, 0.65); text-align: center; margin: 0 0 36px; letter-spacing: 1.5px; text-transform: uppercase; }

        .et-error { background: rgba(220,60,80,0.14); border: 1px solid rgba(220,80,100,0.35); color: #f08090; padding: 12px 16px; border-radius: 12px; font-size: 12px; margin-bottom: 20px; letter-spacing: 0.3px; }

        .et-field { position: relative; margin-bottom: 16px; }
        .et-field-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: rgba(155,109,255,0.7); font-size: 16px; pointer-events: none; z-index: 2; }

        .et-input {
          width: 100%; padding: 14px 16px 14px 44px;
          background: rgba(255, 255, 255, 0.06);
          border: 1.5px solid rgba(155, 109, 255, 0.18);
          border-radius: 12px; color: #e8e4f8;
          font-family: 'DM Mono', monospace; font-size: 13px;
          box-sizing: border-box; outline: none; letter-spacing: 0.3px;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .et-input::placeholder { color: rgba(200, 185, 230, 0.4); font-size: 12px; letter-spacing: 0.5px; }
        .et-input:focus { border-color: rgba(155,109,255,0.6); background: rgba(155,109,255,0.08); box-shadow: 0 0 0 3px rgba(155,109,255,0.1); }

        .et-btn-primary {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #7c4dff 0%, #c060d0 100%);
          border: none; border-radius: 12px; color: #fff;
          font-family: 'DM Mono', monospace; font-size: 12px;
          font-weight: 500; letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; margin-top: 8px;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 8px 24px rgba(124,77,255,0.3);
          position: relative; overflow: hidden;
        }
        .et-btn-primary::before { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0.12); opacity: 0; transition: opacity 0.2s; }
        .et-btn-primary:hover::before { opacity: 1; }
        .et-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(124,77,255,0.4); }
        .et-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .et-footer-link { text-align: center; margin-top: 28px; font-size: 11px; color: rgba(200,185,230,0.55); letter-spacing: 0.5px; }
        .et-footer-link a { color: rgba(155,109,255,0.95); text-decoration: none; margin-left: 6px; transition: color 0.2s; }
        .et-footer-link a:hover { color: #b890ff; }

        .et-strength { margin-top: 8px; display: flex; gap: 4px; }
        .et-strength-bar { height: 3px; flex: 1; border-radius: 2px; background: rgba(155,109,255,0.12); transition: background 0.3s; }
        .et-strength-bar.active-weak { background: #e05060; }
        .et-strength-bar.active-med { background: #d4a030; }
        .et-strength-bar.active-strong { background: #40c080; }
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

          <h1 className="et-heading">Create account</h1>
          <p className="et-sub">Begin your sonic journey</p>

          {errorMsg && <div className="et-error">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="et-field">
              <AiOutlineUser className="et-field-icon" />
              <input
                className="et-input" type="text" name="name" placeholder="Full name"
                value={formData.name} onChange={handleChange}
                onFocus={() => setFocusedInput("name")} onBlur={() => setFocusedInput(null)} required
              />
            </div>

            <div className="et-field">
              <AiOutlineMail className="et-field-icon" />
              <input
                className="et-input" type="email" name="email" placeholder="Email address"
                value={formData.email} onChange={handleChange}
                onFocus={() => setFocusedInput("email")} onBlur={() => setFocusedInput(null)} required
              />
            </div>

            <div className="et-field">
              <AiOutlineLock className="et-field-icon" />
              <input
                className="et-input" type="password" name="password"
                placeholder="Password — min. 6 characters"
                value={formData.password} onChange={handleChange}
                onFocus={() => setFocusedInput("password")} onBlur={() => setFocusedInput(null)} required
              />
              {formData.password.length > 0 && (
                <div className="et-strength">
                  {[0, 1, 2].map((i) => {
                    const len = formData.password.length;
                    const cls = len < 6 ? "active-weak" : len < 10 ? "active-med" : "active-strong";
                    return (
                      <div key={i} className={`et-strength-bar ${i === 0 ? cls : i === 1 && len >= 6 ? cls : i === 2 && len >= 10 ? cls : ""}`} />
                    );
                  })}
                </div>
              )}
            </div>

            <button className="et-btn-primary" type="submit" disabled={isButtonDisabled}>
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="et-footer-link">
            Already have an account?
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Registration;
