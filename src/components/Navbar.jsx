// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { getCurrentUser, logoutUser } from "../utils/authService";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();
  const isAuthenticated = localStorage.getItem("isLoggedIn") === "true";
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const [userData, setUserData] = useState({
    name: "User",
    email: "",
    profilePic: null,
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!currentUser || !isAuthenticated) return;
    const userDocRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            name: data.name || "User",
            email: data.email || currentUser.email,
            profilePic: data.profilePic || null,
          });
        }
      },
      (error) => console.error("Error fetching user data:", error),
    );
    return () => unsubscribe();
  }, [currentUser, isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setShowDropdown(false);
    await logoutUser();
    navigate("/login", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Mono:wght@300;400;500&display=swap');

        .nav-root {
          height: 66px;
          position: sticky;
          top: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          background: rgba(8,8,16,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: box-shadow 0.3s ease;
          font-family: 'DM Mono', monospace;
        }

        .nav-root.scrolled {
          box-shadow: 0 4px 40px rgba(0,0,0,0.5);
          border-bottom-color: rgba(155,109,255,0.12);
        }

        /* LOGO */
        .nav-logo {
          display: flex;
          align-items: baseline;
          gap: 5px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .nav-logo-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 300;
          color: #f0eef8;
          letter-spacing: 3px;
          transition: color 0.2s;
        }

        .nav-logo:hover .nav-logo-text { color: #c8a8ff; }

        .nav-logo-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #9b6dff, #e060c0);
          flex-shrink: 0;
          box-shadow: 0 0 10px rgba(155,109,255,0.7);
          margin-bottom: 2px;
        }

        /* LEFT LINKS */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .nav-link {
          padding: 7px 14px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(180,170,210,0.5);
          transition: color 0.2s, background 0.2s;
          position: relative;
        }

        .nav-link:hover { color: rgba(240,238,248,0.8); background: rgba(255,255,255,0.04); }

        .nav-link.active {
          color: rgba(155,109,255,0.9);
          background: rgba(155,109,255,0.08);
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(155,109,255,0.7), transparent);
        }

        /* RIGHT */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .nav-avatar-wrap {
          position: relative;
        }

        .nav-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(155,109,255,0.3);
          cursor: pointer;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(155,109,255,0.1);
          transition: border-color 0.2s, box-shadow 0.2s;
          font-size: 14px;
          color: rgba(155,109,255,0.8);
        }

        .nav-avatar:hover {
          border-color: rgba(155,109,255,0.6);
          box-shadow: 0 0 16px rgba(155,109,255,0.2);
        }

        .nav-avatar img { width: 100%; height: 100%; object-fit: cover; }

        /* DROPDOWN */
        .nav-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 240px;
          background: rgba(12,12,22,0.96);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 8px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03);
          animation: dropIn 0.2s ease;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .nav-dropdown-user {
          padding: 12px 12px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 6px;
        }

        .nav-dropdown-name {
          font-size: 13px;
          font-weight: 500;
          color: #f0eef8;
          margin-bottom: 2px;
          letter-spacing: 0.3px;
        }

        .nav-dropdown-email {
          font-size: 10px;
          color: rgba(180,170,210,0.4);
          letter-spacing: 0.3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .nav-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          color: rgba(180,170,210,0.7);
          letter-spacing: 0.5px;
          transition: background 0.15s, color 0.15s;
          text-decoration: none;
        }

        .nav-dropdown-item:hover { background: rgba(255,255,255,0.05); color: #f0eef8; }
        .nav-dropdown-item.danger { color: rgba(220,80,80,0.7); }
        .nav-dropdown-item.danger:hover { background: rgba(220,80,80,0.08); color: rgba(220,80,80,1); }

        .nav-dropdown-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .nav-dropdown-divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 6px 0;
        }

        /* Login link */
        .nav-login-link {
          padding: 8px 16px;
          background: rgba(155,109,255,0.1);
          border: 1px solid rgba(155,109,255,0.2);
          border-radius: 8px;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(155,109,255,0.8);
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }

        .nav-login-link:hover {
          background: rgba(155,109,255,0.18);
          border-color: rgba(155,109,255,0.4);
          color: rgba(155,109,255,1);
        }
      `}</style>

      <nav className={`nav-root ${scrolled ? "scrolled" : ""}`}>
        {/* LEFT: Nav links */}
        <div className="nav-links" style={{ minWidth: "200px" }}>
          {isAuthenticated && (
            <>
              <Link
                to="/main"
                className={`nav-link ${isActive("/main") ? "active" : ""}`}
              >
                Home
              </Link>
              <Link
                to="/language"
                className={`nav-link ${isActive("/language") ? "active" : ""}`}
              >
                Languages
              </Link>
            </>
          )}
        </div>

        {/* CENTER: Logo */}
        <Link to="/" className="nav-logo">
          <span className="nav-logo-text">EmoTune</span>
          <div className="nav-logo-dot" />
        </Link>

        {/* RIGHT: Auth */}
        <div
          className="nav-right"
          style={{ minWidth: "200px", justifyContent: "flex-end" }}
        >
          {isAuthenticated ? (
            <div className="nav-avatar-wrap" ref={dropdownRef}>
              <div
                className="nav-avatar"
                onClick={() => setShowDropdown((v) => !v)}
              >
                {userData.profilePic ? (
                  <img src={userData.profilePic} alt="Profile" />
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>

              {showDropdown && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown-user">
                    <div className="nav-dropdown-name">{userData.name}</div>
                    <div className="nav-dropdown-email">{userData.email}</div>
                  </div>

                  <div
                    className="nav-dropdown-item"
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/profile");
                    }}
                  >
                    <div className="nav-dropdown-icon">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    Profile & Settings
                  </div>

                  <div
                    className="nav-dropdown-item"
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/language");
                    }}
                  >
                    <div className="nav-dropdown-icon">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
                      </svg>
                    </div>
                    Languages
                  </div>

                  <div className="nav-dropdown-divider" />

                  <div
                    className="nav-dropdown-item danger"
                    onClick={handleLogout}
                  >
                    <div className="nav-dropdown-icon">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                      </svg>
                    </div>
                    Sign out
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-login-link">
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default NavBar;
