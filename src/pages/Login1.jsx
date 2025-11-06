// src/pages/Login.jsx (UPDATED CODE with Password Toggle)
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import {
  AiOutlineMail,
  AiOutlineLock,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";
// Import real auth functions and context
import { loginUser, loginWithGoogle } from "../utils/authService";
import { useAuth } from "../context/AuthContext";

// Reuse the existing styles object
const styles = {
  /* ... (keep all your original styles here) ... */
  container: {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #0f0f1c 0%, #1a1a2e 50%, #16213e 100%)",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  backgroundCircle: {
    position: "absolute",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(163, 80, 255, 0.1) 0%, transparent 70%)",
    animation: "float 6s ease-in-out infinite",
  },
  formBox: {
    backgroundColor: "rgba(30, 30, 53, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "50px 40px",
    borderRadius: "25px",
    boxShadow:
      "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(163, 80, 255, 0.1)",
    width: "100%",
    maxWidth: "450px",
    border: "1px solid rgba(163, 80, 255, 0.2)",
    position: "relative",
    zIndex: 1,
  },
  title: {
    textAlign: "center",
    background: "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "10px",
    fontSize: "36px",
    fontWeight: "900",
    letterSpacing: "1px",
  },
  subtitle: {
    textAlign: "center",
    color: "#b0b0c2",
    marginBottom: "35px",
    fontSize: "14px",
  },
  inputGroup: {
    position: "relative",
    marginBottom: "20px",
  },
  inputIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "20px",
    color: "#a350ff",
    pointerEvents: "none",
    zIndex: 2, // Ensure icon is above input
  },
  input: {
    width: "100%",
    padding: "15px 15px 15px 50px",
    borderRadius: "12px",
    border: "2px solid rgba(163, 80, 255, 0.2)",
    backgroundColor: "rgba(43, 43, 75, 0.5)",
    color: "#f0f0f0",
    fontSize: "16px",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    outline: "none",
  },
  passwordToggle: {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "20px",
    color: "#a350ff",
    cursor: "pointer",
    zIndex: 3, // Ensure toggle button is clickable
  },
  button: {
    width: "100%",
    padding: "15px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
    color: "white",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "25px",
    transition: "all 0.3s ease",
    boxShadow: "0 5px 25px rgba(163, 80, 255, 0.4)",
  },
  googleButton: {
    width: "100%",
    padding: "15px",
    borderRadius: "12px",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "#f0f0f0",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.3s ease",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "25px 0",
    color: "#b0b0c2",
    fontSize: "14px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background:
      "linear-gradient(to right, transparent, rgba(163, 80, 255, 0.3), transparent)",
  },
  forgotLink: {
    textAlign: "right",
    marginTop: "10px",
    fontSize: "13px",
  },
  linkText: {
    display: "block",
    textAlign: "center",
    marginTop: "25px",
    color: "#a0a0a0",
    fontSize: "14px",
  },
  purpleLink: {
    background: "linear-gradient(135deg, #a350ff 0%, #d957ff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textDecoration: "none",
    fontWeight: "700",
    marginLeft: "5px",
  },
  errorMsg: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    border: "1px solid rgba(255, 107, 107, 0.5)",
    color: "#ff6b6b",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "15px",
    fontSize: "14px",
    textAlign: "center",
  },
};

const Login = () => {
  const navigate = useNavigate();
  const { hasSetLanguage } = useAuth(); // Use AuthContext for language check
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  // NEW STATE: To track password visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // Real Firebase Login
      await loginUser(formData.email, formData.password);

      const shouldRedirectToMain = hasSetLanguage();

      // Navigate/redirect based on language setting
      if (shouldRedirectToMain) {
        navigate("/main", { replace: true });
      } else {
        navigate("/language", { replace: true });
      }
    } catch (error) {
      setIsSubmitting(false);
      // More user-friendly error messages from Firebase codes
      let message = "Login failed. Please check your credentials.";
      if (error.code === "auth/invalid-credential") {
        message = "Invalid email or password.";
      } else if (error.code === "auth/too-many-requests") {
        message =
          "Access temporarily blocked due to too many failed attempts. Try again later.";
      }
      setErrorMsg(`❌ ${message}`);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await loginWithGoogle();

      // Auth state listener handles session.
      const shouldRedirectToMain = hasSetLanguage();

      // Navigate/redirect based on language setting
      navigate(shouldRedirectToMain ? "/main" : "/language", { replace: true });
    } catch (error) {
      setIsSubmitting(false);
      setErrorMsg("❌ Google login failed. Please try again.");
    }
  };

  const handleForgotPassword = () => {
    // Navigate to the dedicated ForgotPassword page
    navigate("/forgot-password");
  };

  // NEW HANDLER: Toggle the state
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={styles.container}>
      {/* Animated background circles */}
      <div
        style={{
          ...styles.backgroundCircle,
          width: "300px",
          height: "300px",
          top: "-100px",
          left: "-100px",
        }}
      />
      <div
        style={{
          ...styles.backgroundCircle,
          width: "400px",
          height: "400px",
          bottom: "-150px",
          right: "-150px",
          animationDelay: "3s",
        }}
      />

      <form style={styles.formBox} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Welcome Back! 👋</h2>
        <p style={styles.subtitle}>Login to continue your vibe</p>

        {/* Error Message Display */}
        {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}

        <div style={styles.inputGroup}>
          <AiOutlineMail style={styles.inputIcon} />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            style={{
              ...styles.input,
              borderColor:
                focusedInput === "email"
                  ? "#a350ff"
                  : "rgba(163, 80, 255, 0.2)",
              boxShadow:
                focusedInput === "email"
                  ? "0 0 20px rgba(163, 80, 255, 0.3)"
                  : "none",
            }}
            value={formData.email}
            onChange={handleChange}
            onFocus={() => setFocusedInput("email")}
            onBlur={() => setFocusedInput(null)}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <AiOutlineLock style={styles.inputIcon} />
          <input
            // UPDATED: Use state to determine input type
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            // UPDATED: Adjust padding for the new toggle button
            style={{
              ...styles.input,
              paddingRight: "50px", // Add space for the eye icon
              borderColor:
                focusedInput === "password"
                  ? "#a350ff"
                  : "rgba(163, 80, 255, 0.2)",
              boxShadow:
                focusedInput === "password"
                  ? "0 0 20px rgba(163, 80, 255, 0.3)"
                  : "none",
            }}
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setFocusedInput("password")}
            onBlur={() => setFocusedInput(null)}
            required
          />
          {/* NEW: Password Visibility Toggle Button */}
          <span
            style={styles.passwordToggle}
            onClick={togglePasswordVisibility}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {/* Use different icon based on state */}
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
        </div>

        <div style={styles.forgotLink}>
          {/* Link to the new ForgotPassword page */}
          <Link
            to="/forgot-password"
            style={{
              color: "#a350ff",
              cursor: "pointer",
              textDecoration: "none",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#d957ff")}
            onMouseLeave={(e) => (e.target.style.color = "#a350ff")}
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          style={{
            ...styles.button,
            opacity: isSubmitting ? 0.7 : 1,
            transform: isSubmitting ? "scale(0.98)" : "scale(1)",
          }}
          disabled={isSubmitting}
          onMouseEnter={(e) =>
            !isSubmitting && (e.target.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            !isSubmitting && (e.target.style.transform = "translateY(0)")
          }
        >
          {isSubmitting ? "Logging in... 🎵" : "Login 🚀"}
        </button>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={{ margin: "0 15px" }}>or</span>
          <div style={styles.dividerLine} />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          style={styles.googleButton}
          disabled={isSubmitting} // Disable during any submission
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              e.target.style.borderColor = "rgba(163, 80, 255, 0.5)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
            }
          }}
        >
          <FcGoogle size={24} />
          Continue with Google
        </button>

        <p style={styles.linkText}>
          Don't have an account?
          <Link to="/register" style={styles.purpleLink}>
            Sign Up
          </Link>
        </p>
      </form>

      <style>
        {`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(5deg); }
                    }
                `}
      </style>
    </div>
  );
};

export default Login;
